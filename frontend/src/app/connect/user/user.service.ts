/**
 * Service managing users.
 */
import {IUser} from '../../model/user/user';
import {Observable} from 'rxjs';
import {IUserDetails} from '../../model/user/user-info';

export abstract class UserService {

    /**
     * Get all available users.
     */
    abstract async getAll(): Promise<IUser[]>;

    /**
     * Get user by ID.
     * @param id of the user
     */
    abstract async getUser(id: number): Promise<IUser>;

    /**
     * Get a batch of users by their ids.
     * @param ids of the users to fetch
     */
    abstract async getBatch(ids: number[]): Promise<IUser[]>;

    /**
     * Get the currently authenticated user.
     */
    abstract async getMe(): Promise<IUser>;

    /**
     * Find a list of users which match the passed search string.
     * @param search string to search users for
     */
    abstract async findUsers(search: string): Promise<IUser[]>;

    /**
     * Update the passed user.
     * @param user to update
     * @return whether the user could be updated
     */
    abstract async updateUser(user: IUser): Promise<boolean>;

    /**
     * Create the passed user.
     * @param user to create
     */
    abstract async createUser(user: IUser): Promise<IUser>;

    /**
     * Delete the passed user.
     * @param id of the user to delete
     */
    abstract async deleteUser(id: number): Promise<boolean>;

    /**
     * Get notification once a user has been changed through the application.
     */
    abstract userChanges(): Observable<IUser>;

}
