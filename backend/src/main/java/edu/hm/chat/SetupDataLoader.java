package edu.hm.chat;

import edu.hm.chat.constants.SecurityConstants;
import edu.hm.chat.persistence.dao.PrivilegeRepository;
import edu.hm.chat.persistence.dao.RoleRepository;
import edu.hm.chat.persistence.dao.UserRepository;
import edu.hm.chat.persistence.model.Privilege;
import edu.hm.chat.persistence.model.Role;
import edu.hm.chat.persistence.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Component
public class SetupDataLoader implements ApplicationListener<ContextRefreshedEvent> {

    /**
     * Whether the setup has already been executed.
     */
    private boolean alreadySetup = false;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PrivilegeRepository privilegeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (alreadySetup) {
            return;
        }

        Privilege readUser = createPrivilegeIfNotFound("READ_USER");
        Privilege writeUser = createPrivilegeIfNotFound("WRITE_USER");

        Privilege readRole = createPrivilegeIfNotFound("READ_ROLE");

        Privilege readChat = createPrivilegeIfNotFound("READ_CHAT");
        Privilege writeChat = createPrivilegeIfNotFound("WRITE_CHAT");

        Privilege readUserDetails = createPrivilegeIfNotFound("READ_USER_DETAILS");
        Privilege writeUserDetails = createPrivilegeIfNotFound("WRITE_USER_DETAILS");

        Privilege uploadFile = createPrivilegeIfNotFound("UPLOAD_FILE");
        Privilege downloadFile = createPrivilegeIfNotFound("DOWNLOAD_FILE");
        Privilege readResourceInfo = createPrivilegeIfNotFound("READ_RESOURCE_INFO");

        List<Privilege> adminPrivileges = Arrays.asList(
                readUser,
                writeUser,
                readRole,
                readUserDetails,
                writeUserDetails,
                uploadFile,
                downloadFile,
                readResourceInfo
        );
        List<Privilege> userPrivileges = Arrays.asList(
                readChat,
                writeChat,
                readUserDetails,
                writeUserDetails,
                uploadFile,
                downloadFile
        );

        Role adminRole = createRoleIfNotFound("ROLE_ADMIN", adminPrivileges);
        Role userRole = createRoleIfNotFound("ROLE_USER", userPrivileges);

        User existingDefaultUser = userRepository.findByEmail(SecurityConstants.DEFAULT_USERNAME);
        if (existingDefaultUser == null) {
            // Create default user
            User defaultUser = new User();
            defaultUser.setRoles(Arrays.asList(userRole, adminRole));
            defaultUser.setEmail(SecurityConstants.DEFAULT_USERNAME);
            defaultUser.setFirstName("Admin");
            defaultUser.setLastName("istrator");
            defaultUser.setPassword(passwordEncoder.encode(SecurityConstants.DEFAULT_PASSWORD));

            userRepository.save(defaultUser);
        }

        alreadySetup = true;
    }

    @Transactional
    Privilege createPrivilegeIfNotFound(String name) {
        Privilege privilege = privilegeRepository.findByName(name);

        if (privilege == null) {
            privilege = new Privilege(name);
            privilegeRepository.save(privilege);
        }

        return privilege;
    }

    @Transactional
    Role createRoleIfNotFound(String name, Collection<Privilege> privileges) {
        Role role = roleRepository.findByName(name);

        if (role == null) {
            role = new Role(name);
            role.setPrivileges(privileges);
            roleRepository.save(role);
        }

        return role;
    }

}
