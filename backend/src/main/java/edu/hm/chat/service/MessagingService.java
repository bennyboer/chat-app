package edu.hm.chat.service;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hm.chat.config.WebSocketConfiguration;
import edu.hm.chat.persistence.dao.ChatRepository;
import edu.hm.chat.persistence.dao.MessageRepository;
import edu.hm.chat.persistence.dao.ResourceInfoRepository;
import edu.hm.chat.persistence.dao.UserRepository;
import edu.hm.chat.persistence.model.Chat;
import edu.hm.chat.persistence.model.Message;
import edu.hm.chat.persistence.model.MessageType;
import edu.hm.chat.persistence.model.User;
import edu.hm.chat.service.model.StompMessage;
import edu.hm.chat.service.model.StompPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import javax.transaction.Transactional;
import java.security.Principal;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * The MessagingService handles all incoming STOMP Messages, which are then forwarded to the correct users.
 */
@Controller
public class MessagingService {

    private final Logger LOGGER = LoggerFactory.getLogger(getClass());

    /**
     * UserService used to map STOMP sessions to chat-users.
     */
    @Autowired
    private StompUserService stompUserService;

    @Autowired
    private SimpMessagingTemplate webSocket;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private ResourceInfoRepository resourceInfoRepository;

    /**
     * Handler for all messages which clients want to send.
     *
     * @param msg  unmarshalled message object, which contains target information
     * @param user is the stomp-session of the sender of the message
     */
    @MessageMapping("/message/sink")
    @Transactional
    public void sendSpecific(@Payload StompMessage msg, Principal user) {
        LOGGER.info("Incoming message: " + msg);
        msg.setTimestamp(new Date().getTime());

        if (msg.getChatId() == null) {
            LOGGER.error("Request did not contain ChatId.");
            return;
        }

        Optional<Chat> chat = chatRepository.findById((long) msg.getChatId());
        if (chat.isEmpty()) {
            LOGGER.error("Chat not found - id {}", msg.getChatId());
            return;
        }

        if (msg.getChatId() == null) {
            LOGGER.error("Request did not contain AuthorID.");
            return;
        }
        Optional<User> author = userRepository.findById((long) msg.getAuthorId());
        if (author.isEmpty()) {
            LOGGER.error("Author not found - id {}", msg.getAuthorId());
            return;
        }

        Set<StompPrincipal> authorConnections = stompUserService.getMappings(author.get().getEmail());
        if (authorConnections.stream().noneMatch(
                (principal -> principal.getName().equals(user.getName()))
        )) {
            LOGGER.error("AuthorID from request did not match connection ID!");
        }

        Message persistentMessage = new Message();
        persistentMessage.setAuthor(author.get());
        persistentMessage.setContent(msg.getContent());
        persistentMessage.setTimestamp(msg.getTimestamp());
        persistentMessage.setChat(chat.get());
        persistentMessage.setType(msg.getType());
        messageRepository.save(persistentMessage);

        if (msg.getType() == MessageType.IMAGE) {
            ObjectMapper mapper = new ObjectMapper();

            try {
                Map<String, String> map = (Map<String, String>) mapper.readValue(msg.getContent(), Map.class);

                // Set permissions to view the image to all chat participants
                var optInfo = resourceInfoRepository.findById(map.get("id"));
                if (optInfo.isEmpty()) {
                    LOGGER.error("Sent image message without image");
                } else {
                    var info = optInfo.get();

                    for (var member : chat.get().getMembers()) {
                        info.getVisibleFor().add(member);
                    }

                    resourceInfoRepository.save(info);
                }
            } catch (JsonProcessingException e) {
                LOGGER.error("Could not parse image message", e);
            }
        }

        Set<StompPrincipal> mappings = stompUserService.getMappingsByUsernames(chat.get().getMembers()
                .stream()
                .map(User::getEmail)
                .collect(Collectors.toList()));
        LOGGER.info("User mapping {}, Size {}", mappings, mappings.size());
        for (StompPrincipal destination : mappings) {
            String targetUser = destination.getName();
            LOGGER.info("Sending direct message to {}", targetUser);
            webSocket.convertAndSendToUser(targetUser, WebSocketConfiguration.USER_DESTINATION, msg);
        }
    }

}
