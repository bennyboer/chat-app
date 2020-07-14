import {UserService} from './user.service';
import {IUser} from '../../model/user/user';
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient, HttpResponse} from '@angular/common/http';

/**
 * User service communicating with a remote endpoint.
 */
@Injectable()
export class RemoteUserService extends UserService {

    /**
     * URL to user controller.
     */
    private static readonly _URL = '/api/user';

    /**
     * Subject emitting events once a user has been changed through the application.
     */
    private _userChangesSubject: Subject<IUser> = new Subject<IUser>();

    constructor(
        private readonly _http: HttpClient
    ) {
        super();
    }

    public async getAll(): Promise<IUser[]> {
        const response: HttpResponse<IUser[]> = await this._http.get<IUser[]>(`${RemoteUserService._URL}`, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 200) {
            return [];
        }

        return !!response.body ? response.body : [];
    }

    public async getUser(id: number): Promise<IUser> {
        const response: HttpResponse<IUser> = await this._http.get<IUser>(`${RemoteUserService._URL}/${id}`, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 200) {
            return null;
        }

        return response.body;
    }

    public async getBatch(ids: number[]): Promise<IUser[]> {
        const response: HttpResponse<IUser[]> = await this._http.post<IUser[]>(`${RemoteUserService._URL}/batch`, ids, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 200) {
            return [];
        }

        return !!response.body ? response.body : [];
    }

    public async getMe(): Promise<IUser> {
        const response: HttpResponse<IUser> = await this._http.get<IUser>(`${RemoteUserService._URL}/me`, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 200) {
            return null;
        }

        return response.body;
    }

    public async findUsers(search: string): Promise<IUser[]> {
        if (!search || search.length === 0) {
            return this.getAll();
        }

        const response: HttpResponse<IUser[]> = await this._http.get<IUser[]>(`${RemoteUserService._URL}/find/${search}`, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 200) {
            return [];
        }

        return !!response.body ? response.body : [];
    }

    public async updateUser(user: IUser): Promise<boolean> {
        const response: HttpResponse<any> = await this._http.put<any>(`${RemoteUserService._URL}/${user.id}`, user, {
            observe: 'response'
        }).toPromise();

        this._userChangesSubject.next(await this.getUser(user.id));

        return response.status === 204;
    }

    public async createUser(user: IUser): Promise<IUser> {
        const response: HttpResponse<any> = await this._http.post<any>(`${RemoteUserService._URL}`, user, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 201) {
            return null;
        }

        // Get ID of new user.
        const location = response.headers.get('Location');
        if (!location) {
            return null;
        }

        const locationParts = location.split('/');
        const newIdStr = locationParts[locationParts.length - 1];
        const newId: number = +newIdStr;
        if (isNaN(newId)) {
            return null;
        }

        return this.getUser(newId);
    }

    public async deleteUser(id: number): Promise<boolean> {
        const response: HttpResponse<any> = await this._http.delete<any>(`${RemoteUserService._URL}/${id}`, {
            observe: 'response'
        }).toPromise();

        return response.status === 200;
    }

    public userChanges(): Observable<IUser> {
        return this._userChangesSubject.asObservable();
    }

}
