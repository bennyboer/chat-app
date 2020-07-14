import {IUserDetails} from '../../../model/user/user-info';
import {Observable} from 'rxjs';
import {IUser} from '../../../model/user/user';

/**
 * Service used to manage user details.
 */
export abstract class UserDetailsService {

    /**
     * Get the details for the passed user.
     * @param userId to get details for
     */
    abstract async get(userId: number): Promise<IUserDetails>;

    /**
     * Get a batch of user details for the passed user ids.
     * @param userIds to get details for
     */
    abstract async getBatch(userIds: number[]): Promise<IUserDetails[]>;

    /**
     * Update the user details.
     * @param details to update
     */
    abstract async update(details: IUserDetails): Promise<boolean>;

    /**
     * Get changes of changed details.
     */
    abstract get changes(): Observable<IUserDetails>;

}
