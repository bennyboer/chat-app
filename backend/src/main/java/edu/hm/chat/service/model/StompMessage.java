package edu.hm.chat.service.model;

import edu.hm.chat.persistence.model.MessageType;

import java.util.Comparator;

/**
 * This class is used to marshal and unmarshal data to be transferred as Stomp messages.
 */
public class StompMessage {

    /**
     * Author ID of the message.
     */
    private final Integer authorId;

    /**
     * Timestamp of the message.
     */
    private Long timestamp;

    /**
     * ChatID if the message is meant for a Group-Chat. Can be Null!
     */
    private final Integer chatId;

    /**
     * UserId if the message is meant for a direct Message. Can be Null!
     */
    private final Integer userId;

    /**
     * The content itself of the message.
     */
    private final String content;

    /**
     * Type of the message.
     */
    private final MessageType type;

    public StompMessage(Integer authorId, Long timestamp, Integer chatId, Integer userId, String content, MessageType type) {
        this.authorId = authorId;
        this.timestamp = timestamp;
        this.chatId = chatId;
        this.userId = userId;
        this.content = content;
        this.type = type;
    }

    // Auto-Generated Methods


    public Integer getAuthorId() {
        return authorId;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    public Integer getChatId() {
        return chatId;
    }

    public Integer getUserId() {
        return userId;
    }

    public String getContent() {
        return content;
    }

    public MessageType getType() {
        return type;
    }

    @Override
    public String toString() {
        return "StompMessage{" +
                "authorId=" + authorId +
                ", timestamp=" + timestamp +
                ", chatId=" + chatId +
                ", userId=" + userId +
                ", content='" + content + '\'' +
                '}';
    }


    public static class StompMessageSortingComparator implements Comparator<StompMessage> {
        @Override
        public int compare(StompMessage message1, StompMessage message2) {
            return message1.getTimestamp().compareTo(message2.getTimestamp());
        }
    }

}
