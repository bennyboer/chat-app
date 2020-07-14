package edu.hm.chat.persistence.dao;

import edu.hm.chat.persistence.model.UserDetails;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository dealing with user details storage.
 */
public interface UserDetailsRepository extends CrudRepository<UserDetails, Long> {
}
