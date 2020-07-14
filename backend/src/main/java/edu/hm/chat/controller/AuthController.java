package edu.hm.chat.controller;

import edu.hm.chat.constants.SecurityConstants;
import edu.hm.chat.controller.user.UserController;
import edu.hm.chat.persistence.dao.RoleRepository;
import edu.hm.chat.persistence.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.SignatureException;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserController userController;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // TODO We need some kind of e-mail confirmation

        // Overwrite role -> we don't care if one is set
        user.setRoles(Collections.singletonList(roleRepository.findByName("ROLE_USER")));

        LOGGER.info(String.format("Going to register new user '%s %s'", user.getFirstName(), user.getLastName()));
        userController.create(user);

        return ResponseEntity.ok().build();
    }

    public static UsernamePasswordAuthenticationToken getAuthenticationForToken(String token) {
        if (StringUtils.isEmpty(token)) {
            return null;
        }
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(SecurityConstants.JWT_SECRET.getBytes())
                    .build()
                    .parseClaimsJws(token.replace(SecurityConstants.TOKEN_PREFIX, ""))
                    .getBody();

            var username = claims.getSubject();

            var privileges = ((List<?>) claims.get("privileges")).stream()
                    .map(authority -> new SimpleGrantedAuthority((String) authority))
                    .collect(Collectors.toList());

            if (StringUtils.isNotEmpty(username)) {
                return new UsernamePasswordAuthenticationToken(username, null, privileges);
            }
        } catch (ExpiredJwtException exception) {
            LOGGER.warn("Request to parse expired JWT : {} failed : {}", token, exception.getMessage());
        } catch (UnsupportedJwtException exception) {
            LOGGER.warn("Request to parse unsupported JWT : {} failed : {}", token, exception.getMessage());
        } catch (MalformedJwtException exception) {
            LOGGER.warn("Request to parse invalid JWT : {} failed : {}", token, exception.getMessage());
        } catch (SignatureException exception) {
            LOGGER.warn("Request to parse JWT with invalid signature : {} failed : {}", token, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            LOGGER.warn("Request to parse empty or null JWT : {} failed : {}", token, exception.getMessage());
        }
        return null;
    }

}
