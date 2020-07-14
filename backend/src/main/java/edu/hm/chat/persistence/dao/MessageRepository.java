package edu.hm.chat.persistence.dao;

import edu.hm.chat.persistence.model.Chat;
import edu.hm.chat.persistence.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.List;

public interface MessageRepository extends PagingAndSortingRepository<Message, Long> {
    Page<Message> findByChat(Chat chat, Pageable pageable);

    @Override
    void delete(Message message);
}
