/**
 * User representation.
 */
import {IRole} from '../auth/role';

export interface IUser {

    /**
     * ID of the user.
     */
    id: number;

    /**
     * First name of the user.
     */
    firstName: string;

    /**
     * Last name of the user.
     */
    lastName: string;

    /**
     * E-Mail adress of the user.
     */
    email?: string;

    /**
     * Password of the user.
     */
    password?: string;

    /**
     * Roles of the user.
     */
    roles?: IRole[];

}
