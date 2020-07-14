import {UserDetailsService} from './user-details.service';
import {Injectable} from '@angular/core';
import {IUserDetails} from '../../../model/user/user-info';
import {Observable} from 'rxjs';

/**
 * Local user details service which can be used for testing.
 */
@Injectable()
export class LocalUserDetailsService extends UserDetailsService {

    public async get(userId: number): Promise<IUserDetails> {
        return {
            userId,
            status: 'Test status'
        };
    }

    public async getBatch(userIds: number[]): Promise<IUserDetails[]> {
        return userIds.map((id) => {
            return {
                userId: id,
                status: 'Test status'
            } as IUserDetails;
        });
    }

    public async update(details: IUserDetails): Promise<boolean> {
        return true;
    }

    public get changes(): Observable<IUserDetails> {
        return null;
    }

}
