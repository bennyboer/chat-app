/**
 * A chat message representation.
 */
export interface IMessage {

    /**
     * The user ID of the author of the message.
     */
    authorId: number;

    /**
     * Timestamp of the message.
     */
    timestamp?: number;

    /**
     * Content of the message.
     */
    content: string;

    /**
     * Type of the message.
     */
    type: string;

    /**
     * ID of the chat the message belongs to.
     */
    chatId?: number;

}
