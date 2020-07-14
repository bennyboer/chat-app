import {UserDetailsService} from './user-details.service';
import {Injectable} from '@angular/core';
import {IUserDetails} from '../../../model/user/user-info';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {IUser} from '../../../model/user/user';

/**
 * Service used to manage user details.
 */
@Injectable()
export class RemoteUserDetailsService extends UserDetailsService {

    /**
     * URL to controller.
     */
    private static readonly _URL = '/api/user/details';

    /**
     * Subject emitting events when the user details are changed.
     */
    private _updateSubject: Subject<IUserDetails> = new Subject<IUserDetails>();

    constructor(
        private readonly _http: HttpClient
    ) {
        super();
    }

    public async get(userId: number): Promise<IUserDetails> {
        const response: HttpResponse<IUserDetails> = await this._http.get<IUserDetails>(`${RemoteUserDetailsService._URL}/${userId}`, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 200) {
            return null;
        }

        return response.body;
    }

    public async getBatch(userIds: number[]): Promise<IUserDetails[]> {
        const response: HttpResponse<IUserDetails[]> = await this._http.post<IUserDetails[]>(`${RemoteUserDetailsService._URL}/batch`, userIds, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 200) {
            return [];
        }

        return !!response.body ? response.body : [];
    }

    public async update(details: IUserDetails): Promise<boolean> {
        const response: HttpResponse<any> = await this._http.post<any>(`${RemoteUserDetailsService._URL}`, details, {
            observe: 'response'
        }).toPromise();

        if (response.status === 200) {
            this._updateSubject.next(details);
            return true;
        }

        return false;
    }

    public get changes(): Observable<IUserDetails> {
        return this._updateSubject.asObservable();
    }

}
