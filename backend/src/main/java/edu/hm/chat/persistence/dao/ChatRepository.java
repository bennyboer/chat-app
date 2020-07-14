package edu.hm.chat.persistence.dao;

import edu.hm.chat.persistence.model.Chat;
import edu.hm.chat.persistence.model.User;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface ChatRepository extends CrudRepository<Chat, Long> {
    List<Chat> findByMembersContaining(User user);

    List<Chat> findByOwnerEquals(User user);

    @Override
    void delete(Chat chat);

}
