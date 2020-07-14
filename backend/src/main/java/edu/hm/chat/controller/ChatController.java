package edu.hm.chat.controller;

import edu.hm.chat.persistence.dao.ChatRepository;
import edu.hm.chat.persistence.dao.MessageRepository;
import edu.hm.chat.persistence.dao.UserRepository;
import edu.hm.chat.persistence.model.Chat;
import edu.hm.chat.persistence.model.Message;
import edu.hm.chat.persistence.model.Role;
import edu.hm.chat.persistence.model.User;
import edu.hm.chat.service.model.StompMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.transaction.Transactional;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private ChatRepository chatRepository;

	@Autowired
	private MessageRepository messageRepository;


	@PreAuthorize("hasAuthority('READ_CHAT')")
	@GetMapping
	public ResponseEntity<Iterable<Chat>> getAll(Principal principal) {
		User currentUser = userRepository.findByEmail(principal.getName());
		Iterable<Chat> chats = chatRepository.findAll();
		ArrayList<Chat> containingChats = new ArrayList<>();
		for(Chat chat : chats) {
			if (chat.getMembers().contains(currentUser)) {
				containingChats.add(chat);
			}
		}
		return ResponseEntity.ok(containingChats);
	}

	@PreAuthorize("hasAuthority('READ_CHAT')")
	@GetMapping("/{id}")
	public ResponseEntity<Chat> get(@PathVariable Long id, Principal principal) {
		User currentUser = userRepository.findByEmail(principal.getName());
		var chat = chatRepository.findById(id);
		if (chat.isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		if (!chat.get().getMembers().contains(currentUser)) {
			return ResponseEntity.status(403).build();
		}
		return ResponseEntity.ok(chat.get());
	}

	@PreAuthorize("hasAuthority('READ_CHAT')")
	@GetMapping("/{id}/messages")
	@Transactional
	public ResponseEntity<List<StompMessage>> getChatMessages(@PathVariable Long id, @RequestParam Integer page, Principal principal) {
		List<StompMessage> messages = new ArrayList<>();
		Optional<Chat> currentChat = chatRepository.findById(id);
		User currentUser = userRepository.findByEmail(principal.getName());

		if (currentChat.isEmpty() || page < 0)
			return ResponseEntity.notFound().build();
		if (!currentChat.get().getMembers().contains(currentUser))
			return ResponseEntity.badRequest().build();

		Pageable pageable = PageRequest.of(page, 20, Sort.by("timestamp").descending());
		for (Message message : messageRepository.findByChat(currentChat.get(), pageable)) {
			messages.add(new StompMessage(message.getAuthor().getId().intValue(),
					message.getTimestamp(),
					message.getChat().getId().intValue(),
					null,
					message.getContent(),
					message.getType()));
		}

		messages.sort(new StompMessage.StompMessageSortingComparator());
		return ResponseEntity.ok(messages);
	}

	@PreAuthorize("hasAuthority('READ_CHAT')")
	@GetMapping("/for/{userId}")
	public ResponseEntity<Iterable<Chat>> getForMember(@PathVariable Long userId, Principal principal) {
		User currentUser = userRepository.findByEmail(principal.getName());
		var user = userRepository.findById(userId);

		if (user.isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		if (currentUser.getId() != user.get().getId()) {
			return ResponseEntity.status(403).build();
		}

		return ResponseEntity.ok(chatRepository.findByMembersContaining(user.get()));
	}

	@PreAuthorize("hasAuthority('READ_CHAT')")
	@GetMapping("/find/{search}")
	public ResponseEntity<Iterable<Chat>> find(@PathVariable String search, Principal principal) {
		var result = new ArrayList<Chat>();
		for (var chat : chatRepository.findAll()) {
			if (chat.getName().contains(search)) {
				result.add(chat);
			}
		}

		return ResponseEntity.ok(result);
	}

	@PreAuthorize("hasAuthority('WRITE_CHAT')")
	@PostMapping
	public ResponseEntity<Chat> create(@RequestBody Chat chat, Principal principal) {
		User currentUser = userRepository.findByEmail(principal.getName());

		// Check that at least the owner is in the members list
		boolean hasCurrentUser = false;
		for (User member : chat.getMembers()) {
			if (member.getId().equals(currentUser.getId())) {
				hasCurrentUser = true;
				break;
			}
		}

		if (!hasCurrentUser) {
			chat.getMembers().add(currentUser);
		}

		chat.setOwner(currentUser);

		Chat createdChat = chatRepository.save(chat);
		return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
				.buildAndExpand(createdChat.getId()).toUri())
				.build();
	}

	@PreAuthorize("hasAuthority('WRITE_CHAT')")
	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Chat chat, Principal principal) {
		return chatRepository.findById(id).map((found) -> {
			User currentUser = userRepository.findByEmail(principal.getName());
			if (found.getOwner().getId().equals(currentUser.getId())) {
				found.setName(chat.getName());
				chatRepository.save(found);
				return ResponseEntity.noContent().build();
			} else {
			    return ResponseEntity.status(403).build();
            }
		}).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@PreAuthorize("hasAuthority('WRITE_CHAT')")
	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable Long id, Principal principal) {
		User currentUser = userRepository.findByEmail(principal.getName());

		return deleteForUser(id, currentUser);
	}

	/**
	 * Delete the chat for the passed user.
	 *
	 * @param chatId to delete for the passed user
	 * @param user   to delete chat for
	 * @return response
	 */
	public ResponseEntity<?> deleteForUser(Long chatId, User user) {
		return chatRepository.findById(chatId).map((chat) -> {
			boolean isOwner = chat.getOwner().getId().equals(user.getId());

			chat.getMembers().remove(user);

			if (chat.getMembers().isEmpty()) {
				chatRepository.delete(chat);
			} else {
				if (isOwner) {
					chat.setOwner(chat.getMembers().get(0));
				}

				chatRepository.save(chat);
			}

			return ResponseEntity.ok().build();
		}).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@PreAuthorize("hasAuthority('WRITE_CHAT')")
	@DeleteMapping("/force/{id}")
	public ResponseEntity<?> forceDelete(@PathVariable Long id, Principal principal) {
		User currentUser = userRepository.findByEmail(principal.getName());

		// Only the administrator is able to force delete a chat
		boolean isAdmin = currentUser.getRoles().stream().map(Role::getName).anyMatch((rn) -> rn.equals("ROLE_ADMIN"));
		if (!isAdmin) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only an administrator is able to force delete a chat");
		}

		return chatRepository.findById(id).map((chat) -> {
			chatRepository.delete(chat);

			return ResponseEntity.ok().build();
		}).orElseGet(() -> ResponseEntity.notFound().build());
	}

}
