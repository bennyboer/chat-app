import {IChat} from '../../model/chat/chat';

/**
 * Service dealing with chat messages.
 */
export abstract class ChatService {

    /**
     * Get all available chats.
     * @param userId of the user to get chats for
     */
    abstract async getAll(userId: number): Promise<IChat[]>;

    /**
     * Get the chat for the passed ID.
     * @param id of the chat to fetch.
     */
    abstract async getForId(id: number): Promise<IChat>;

    /**
     * Create a new chat for the passed user.
     * @param userId to create chat for
     * @param chat to create (ID will be overwritten)
     * @return the ID of the new chat
     */
    abstract async create(userId: number, chat: IChat): Promise<number>;

    /**
    * Updates the passed chat.
    * @param chat to update. The id will be read from chat.
    */
    abstract async update(chat: IChat): Promise<boolean>;

    /**
     * Remove the chat with the passed ID.
     * @param id to remove chat for
     */
    abstract async remove(id: number): Promise<boolean>;

}
