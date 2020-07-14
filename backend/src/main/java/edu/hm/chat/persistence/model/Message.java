package edu.hm.chat.persistence.model;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Objects;

@Entity
public class Message {
    @Id
    @Column(unique = true, nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotNull
    @ManyToOne
    private User author;

    @NotNull
    private Long timestamp;

    @NotNull
    @Column(length = 5000)
    private String content;

    @NotNull
    @Enumerated(EnumType.STRING)
    private MessageType type;

    @NotNull
    @ManyToOne
    private Chat chat;

    public Message() {
    }

    public Message(Message from) {
        this.id = from.id;
        this.author = from.author;
        this.timestamp = from.timestamp;
        this.content = from.content;
        this.chat = from.chat;
        this.type = from.type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Chat getChat() {
        return chat;
    }

    public void setChat(Chat chat) {
        this.chat = chat;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Message message = (Message) o;

        if (!Objects.equals(id, message.id)) return false;
        if (!Objects.equals(author, message.author)) return false;
        if (!Objects.equals(timestamp, message.timestamp)) return false;
        if (!Objects.equals(content, message.content)) return false;
        if (type != message.type) return false;
        return Objects.equals(chat, message.chat);
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (author != null ? author.hashCode() : 0);
        result = 31 * result + (timestamp != null ? timestamp.hashCode() : 0);
        result = 31 * result + (content != null ? content.hashCode() : 0);
        result = 31 * result + (type != null ? type.hashCode() : 0);
        result = 31 * result + (chat != null ? chat.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Message{" +
                "id=" + id +
                ", author=" + author +
                ", timestamp=" + timestamp +
                ", content='" + content + "'" +
                ", chat='" + chat + "'" +
                '}';
    }
}
