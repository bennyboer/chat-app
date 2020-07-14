package edu.hm.chat.service.model;

import java.security.Principal;
import java.util.Objects;

/**
 * A StompPrincipal is assigned to each user connected to the messaging service.
 *
 * For more information:
 * https://stackoverflow.com/questions/37853727/where-user-comes-from-in-convertandsendtouser-works-in-sockjsspring-websocket
 */
public class StompPrincipal implements Principal {

    private final String name;

    public StompPrincipal(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StompPrincipal that = (StompPrincipal) o;
        return Objects.equals(name, that.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }
}