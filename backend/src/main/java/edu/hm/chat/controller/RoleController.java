package edu.hm.chat.controller;

import edu.hm.chat.persistence.dao.RoleRepository;
import edu.hm.chat.persistence.dao.UserRepository;
import edu.hm.chat.persistence.model.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/role")
public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @PreAuthorize("hasAuthority('READ_ROLE')")
    @GetMapping
    public ResponseEntity<Iterable<Role>> getAll() {
        return ResponseEntity.ok(roleRepository.findAll());
    }

    @PreAuthorize("hasRole('READ_ROLE') and hasRole('READ_USER')")
    @GetMapping("/{userId}")
    public ResponseEntity<List<Role>> getForUser(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .map(u -> ResponseEntity.ok(u.getRoles()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('READ_ROLE') and hasRole('WRITE_USER')")
    @PutMapping("/{userId}")
    public ResponseEntity<?> setForUser(@PathVariable Long userId, @RequestBody List<Long> roleIds) {
        return userRepository.findById(userId).map(u -> {
            List<Role> roleList = new ArrayList<>();
            roleRepository.findAllById(roleIds).forEach(roleList::add);

            u.setRoles(roleList);

            userRepository.save(u);
            return ResponseEntity.ok().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

}
