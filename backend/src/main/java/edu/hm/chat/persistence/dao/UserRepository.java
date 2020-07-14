package edu.hm.chat.persistence.dao;

import edu.hm.chat.persistence.model.Role;
import edu.hm.chat.persistence.model.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface UserRepository extends CrudRepository<User, Long> {
    User findByEmail(String email);

    List<User> findByRolesContaining(Role role);

    @Override
    void delete(User user);

}
