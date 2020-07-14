/**
 * Service used to send and receive messages for a chat.
 */
import {IMessage} from '../../model/chat/message';
import {Observable} from 'rxjs';

/**
 * Service used for messaging.
 */
export abstract class MessageService {

    abstract async connect(): Promise<void>;

    abstract async disconnect(): Promise<void>;

    /**
     * Get message for the passed chat.
     * @param chatId to get messages for
     * @param page to load the next several messages of
     */
    abstract async getAll(chatId: number, page: number): Promise<IMessage[]>;

    /**
     * Send a message.
     * @param chatId to send message for
     * @param userId of the sending user
     * @param message string
     * @param messageType type of the message
     */
    abstract async send(chatId: number, userId: number, message: string, messageType: string): Promise<void>;

    /**
     * Get observable of messages for a chat.
     * @param chatId to observe messages ofl
     */
    abstract changes(chatId: number): Observable<IMessage>;

    /**
     * Get observable of all changes to all chats.
     */
    abstract allChanges(): Observable<[number, IMessage]>;

}
