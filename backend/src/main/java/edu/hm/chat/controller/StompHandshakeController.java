package edu.hm.chat.controller;

import edu.hm.chat.service.model.StompPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

public class StompHandshakeController extends DefaultHandshakeHandler {

    private final Logger LOGGER = LoggerFactory.getLogger(getClass());

    @Override
    protected Principal determineUser(ServerHttpRequest request,
                                      WebSocketHandler wsHandler,
                                      Map<String, Object> attributes) {
        // TODO: We need to create a cached mapping from Username to UUID
        // Generate principal with UUID as name
        String uuid = UUID.randomUUID().toString();
        LOGGER.info("Connected new user to messaging socket, UUID: " + uuid);
        return new StompPrincipal(uuid);
    }
}