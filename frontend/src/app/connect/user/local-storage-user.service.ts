import {UserService} from './user.service';
import {IUser} from '../../model/user/user';
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

/**
 * User service using only local storage.
 */
@Injectable()
export class LocalStorageUserService extends UserService {

    /**
     * List of fake users.
     */
    private static readonly FAKE_USERS: IUser[] = [
        {
            id: 1,
            email: 'max.mustermann@localhost',
            firstName: 'Max',
            lastName: 'Mustermann'
        },
        {
            id: 2,
            email: 'john.doe@localhost',
            firstName: 'John',
            lastName: 'Doe'
        },
        {
            id: 3,
            email: 'another.user@localhost',
            firstName: 'Another',
            lastName: 'User'
        },
        {
            id: 42,
            email: 'benjamin.eder@localhost',
            firstName: 'Benjamin',
            lastName: 'Eder'
        }
    ];

    /**
     * Users currently held by the service.
     */
    private _users: IUser[] = LocalStorageUserService.FAKE_USERS;

    /**
     * Subject emitting events once a user has been changed through the application.
     */
    private _userChangesSubject: Subject<IUser> = new Subject<IUser>();

    public async getAll(): Promise<IUser[]> {
        return this._users;
    }

    public async getUser(id: number): Promise<IUser> {
        return this._users.find((u) => u.id === id);
    }

    public async getBatch(ids: number[]): Promise<IUser[]> {
        return [];
    }

    public async getMe(): Promise<IUser> {
        return this.getUser(42);
    }

    public async findUsers(search: string): Promise<IUser[]> {
        return this._users.filter((u) => `${u.firstName} ${u.lastName}`.toLowerCase().indexOf(search.toLowerCase()) !== -1);
    }

    public async updateUser(user: IUser): Promise<boolean> {
        const oldUser = await this.getUser(user.id);
        if (!oldUser) {
            return false;
        }

        oldUser.email = user.email;
        oldUser.firstName = user.firstName;
        oldUser.lastName = user.lastName;

        this._userChangesSubject.next(oldUser);

        return true;
    }

    public async createUser(user: IUser): Promise<IUser> {
        user.id = this._users.length + 100;
        this._users.push(user);
        return user;
    }

    public async deleteUser(id: number): Promise<boolean> {
        return false;
    }

    public userChanges(): Observable<IUser> {
        return this._userChangesSubject.asObservable();
    }

}
