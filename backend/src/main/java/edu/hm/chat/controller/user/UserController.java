package edu.hm.chat.controller.user;

import edu.hm.chat.controller.ChatController;
import edu.hm.chat.persistence.dao.ChatRepository;
import edu.hm.chat.persistence.dao.UserDetailsRepository;
import edu.hm.chat.persistence.dao.UserRepository;
import edu.hm.chat.persistence.model.Chat;
import edu.hm.chat.persistence.model.User;
import edu.hm.chat.persistence.model.UserDetails;
import edu.hm.chat.service.ResourceStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/api/user")
public class UserController {

    /**
     * Logger for the controller.
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserDetailsRepository userDetailsRepository;

    @Autowired
    private ResourceStorageService resourceStorageService;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private ChatController chatController;

    @PreAuthorize("hasAuthority('READ_USER')")
    @GetMapping
    public ResponseEntity<Iterable<User>> getAll() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PreAuthorize("hasAuthority('READ_USER')")
    @GetMapping("/{id}")
    public ResponseEntity<User> get(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAuthority('READ_USER')")
    @PostMapping("/batch")
    public ResponseEntity<List<User>> getBatch(@RequestBody List<Long> userIds) {
        return ResponseEntity.ok(StreamSupport
                .stream(userRepository.findAllById(userIds).spliterator(), false)
                .collect(Collectors.toList()));
    }

    @PreAuthorize("hasAuthority('READ_USER')")
    @GetMapping("/find/{search}")
    public ResponseEntity<Iterable<User>> find(@PathVariable String search) {
        var result = new ArrayList<User>();
        for (var user : userRepository.findAll()) {
            String name = String.format("%s %s", user.getFirstName(), user.getLastName());
            if (name.contains(search)) {
                result.add(user);
            }
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe(Principal principal) {
        return Optional.ofNullable(userRepository.findByEmail(principal.getName()))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAuthority('WRITE_USER')")
    @PostMapping
    public ResponseEntity<User> create(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User newUser = userRepository.save(user);
        return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newUser.getId()).toUri())
                .build();
    }

    @PreAuthorize("hasAuthority('WRITE_USER')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody User user) {
        return userRepository.findById(id).map((u) -> {
            if (user.getPassword() != null) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            } else {
                user.setPassword(u.getPassword());
            }

            userRepository.save(user);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAuthority('WRITE_USER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Principal principal) {
        User currentUser = userRepository.findByEmail(principal.getName());

        if (id.equals(currentUser.getId())) {
            // A user cannot delete himself
            return ResponseEntity.badRequest().build();
        }

        return userRepository.findById(id).map((u) -> {
            Optional<UserDetails> details = userDetailsRepository.findById(u.getId());
            if (details.isPresent()) {
                String imageID = details.get().getImageId();
                if (imageID != null) {
                    try {
                        resourceStorageService.remove(imageID);
                    } catch (IOException e) {
                        LOGGER.error("Could not delete image of user during user removal", e);
                    }
                }

                userDetailsRepository.deleteById(u.getId()); // Remove details as well
            }

            List<Chat> referencedInChats = chatRepository.findByMembersContaining(u);
            if (referencedInChats != null && referencedInChats.size() > 0) {
                // Remove user to delete from referenced chats
                for (var chat : referencedInChats) {
                    chatController.deleteForUser(chat.getId(), u);
                }
            }

            userRepository.delete(u);

            return ResponseEntity.ok().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

}
