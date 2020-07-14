package edu.hm.chat.config;


import edu.hm.chat.constants.SecurityConstants;
import edu.hm.chat.controller.AuthController;
import edu.hm.chat.controller.StompHandshakeController;
import edu.hm.chat.service.StompUserService;
import edu.hm.chat.service.model.StompPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Optional;

@CrossOrigin
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfiguration implements WebSocketMessageBrokerConfigurer {

    private final Logger LOGGER = LoggerFactory.getLogger(getClass());

    private static final String USER_DESTINATION_PREFIX = "/user";
    public static String USER_DESTINATION = "/queue/specific-user";

    @Autowired
    private StompUserService stompUserService;

    /**
     * This resource can be used for clients to register as Stomp Endpoints.
     * Only one connection is required per client.
     * @param registry where clients can establish new connections
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/socket-registry")
                .setAllowedOrigins("*")
                .setHandshakeHandler(new StompHandshakeController())
                .withSockJS();
    }


    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker(USER_DESTINATION);
        registry.setUserDestinationPrefix(USER_DESTINATION_PREFIX);
    }


    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {

        ChannelInterceptor channelInterceptor = new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor == null) {
                    return message;
                }

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authToken = accessor.getFirstNativeHeader(SecurityConstants.TOKEN_HEADER);
                    UsernamePasswordAuthenticationToken authentication = AuthController.getAuthenticationForToken(authToken);

                    if (authentication == null) {
                        throw new IllegalStateException("Attempted to connect to WebSocket with illegal token " + authToken);
                    }

                    if ( !(accessor.getUser() instanceof StompPrincipal)) {
                        throw new IllegalStateException("Stomp connection was not assigned to a valid UUID for this session.");
                    }

                    stompUserService.addMapping(authentication.getName(), (StompPrincipal) accessor.getUser());
                    LOGGER.info("WebSocket Connected, mapping user '{}' to UUID '{}'", authentication.getName(), accessor.getUser().getName());

                } else if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {

                    LOGGER.info("WebSocket Disconnect request.");
                    if ( !(accessor.getUser() instanceof  StompPrincipal)) {
                        LOGGER.warn("Disconnect request with invalid user data. ('{}')", accessor.getUser());
                    } else {
                        StompPrincipal stompPrincipal = (StompPrincipal) accessor.getUser();
                        Optional<String> userByPrincipal = stompUserService.findUserByPrincipal(stompPrincipal);
                        if (userByPrincipal.isPresent()) {
                            stompUserService.removeMapping(userByPrincipal.get(), stompPrincipal);
                            LOGGER.info("WebSocket Disconnected, removing mapping for user '{}' to UUID '{}'",
                                    userByPrincipal.get(), stompPrincipal.getName());
                        }
                    }
                }

                // TODO: We somehow need to keep track of timed out connections too. I have no idea how tho.

                return message;
            }
        };

        registration.interceptors(channelInterceptor);

    }



}
