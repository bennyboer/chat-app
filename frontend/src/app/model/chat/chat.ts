/**
 * Chat model representation.
 */
import {IUser} from '../user/user';

export interface IChat {

    /**
     * ID of the chat.
     */
    id: number;

    /**
     * Name of the chat.
     */
    name: string;

    /**
     * Owner of the chat
     */
    owner: IUser;

    /**
     * Users involved in the chat.
     */
    members: IUser[];

}
