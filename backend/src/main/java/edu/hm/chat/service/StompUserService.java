package edu.hm.chat.service;

import edu.hm.chat.persistence.model.Chat;
import edu.hm.chat.persistence.model.User;
import edu.hm.chat.service.model.StompPrincipal;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * This service keeps track of all open Stomp connections.
 * It is used to map usernames to stomp connections, this is required for realtime notifications to the users.
 */
@Service("stompUserService")
public class StompUserService {

    private final Map<String, Set<StompPrincipal>> userToStompPrincipal = new HashMap<>();

    /**
     * Adds a new entry to the cached user mappings.
     * @param username for which the mapping will be updated
     * @param principal to which it will be mapped
     */
    public void addMapping(String username, StompPrincipal principal) {
        if (!userToStompPrincipal.containsKey(username)) {
            userToStompPrincipal.put(username, new HashSet<>());
        }
        userToStompPrincipal.get(username).add(principal);
    }

    /**
     * A reverse lookup to find the username to a stomp-principal.
     * @param principal which will be searched in currently connected users.
     * @return first username which has a mapping to the principal
     */
    public Optional<String> findUserByPrincipal(StompPrincipal principal) {
        for (String username : userToStompPrincipal.keySet()) {
            if (userToStompPrincipal.get(username).contains(principal)) {
                return Optional.of(username);
            }
        }
        return Optional.empty();
    }

    /**
     * Removes a name -> UUID mapping from the cached data.
     * @param username which was mapped to the UUID
     * @param principal UUID principal to be removed
     */
    public void removeMapping(String username, StompPrincipal principal) {
        if (userToStompPrincipal.containsKey(username)) {
            userToStompPrincipal.get(username).remove(principal);
            if (userToStompPrincipal.get(username).isEmpty()) {
                userToStompPrincipal.remove(username);
            }
        }
    }

    /**
     * @param username for which the UUID mapping will be searched.
     * @return all StompPrincipals for the given user
     */
    public Set<StompPrincipal> getMappings(String username) {
        if (!userToStompPrincipal.containsKey(username)) {
            return Set.of();
        }
        return new HashSet<>(userToStompPrincipal.get(username));
    }

    public Set<StompPrincipal> getMappingsByUsernames(List<String> usernames) {
        Set<StompPrincipal> mappings = new HashSet<>();
        for (String groupMember : usernames) {
            mappings.addAll(getMappings(groupMember));
        }
        return mappings;
    }

}
