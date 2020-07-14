package edu.hm.chat.service;

import edu.hm.chat.constants.SecurityConstants;
import edu.hm.chat.persistence.dao.RoleRepository;
import edu.hm.chat.persistence.dao.UserRepository;
import edu.hm.chat.persistence.model.Privilege;
import edu.hm.chat.persistence.model.Role;
import edu.hm.chat.persistence.model.User;
import edu.hm.chat.security.AuthenticatedUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service("userDetailsService")
@Transactional
public class UserService implements UserDetailsService {

    private final Logger LOGGER = LoggerFactory.getLogger(getClass());

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        LOGGER.info(String.format("Trying to authenticate user with email '%s'", email));

        var admin_users = userRepository.findByRolesContaining(roleRepository.findByName("ROLE_ADMIN"));
        if (email.equals(SecurityConstants.DEFAULT_USERNAME) && admin_users.size() > 1) {
            LOGGER.warn("Cannot authenticate with default user credentials once another Administrator exists");
            throw new UsernameNotFoundException("Cannot authenticate with default user credentials once another Administrator exists");
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException(String.format("User with email %s does not exist", email));
        }

        LOGGER.info(String.format("Successfully authenticated user with email '%s'", email));

        return new AuthenticatedUserDetails(user, getAuthorities(user.getRoles()));
    }

    private Collection<GrantedAuthority> getAuthorities(Collection<Role> roles) {
        return getPrivileges(roles).stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList());
    }

    private List<String> getPrivileges(Collection<Role> roles) {
        List<String> privileges = new ArrayList<>();
        List<Privilege> collection = new ArrayList<>();

        for (Role role : roles) {
            collection.addAll(role.getPrivileges());
        }

        for (Privilege item : collection) {
            privileges.add(item.getName());
        }

        return privileges;
    }

}
