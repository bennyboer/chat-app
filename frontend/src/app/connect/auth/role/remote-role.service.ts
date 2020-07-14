import {RoleService} from './role.service';
import {Injectable} from '@angular/core';
import {IRole} from '../../../model/auth/role';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {IUser} from '../../../model/user/user';

/**
 * Role service working with remote resource.
 */
@Injectable()
export class RemoteRoleService extends RoleService {

    /**
     * URL of the role controller.
     */
    private static readonly _URL = '/api/role';

    constructor(
        private readonly _http: HttpClient
    ) {
        super();
    }

    public async getAll(): Promise<IRole[]> {
        const response: HttpResponse<IRole[]> = await this._http.get<IRole[]>(`${RemoteRoleService._URL}`, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 200) {
            return [];
        }

        return !!response.body ? response.body : [];
    }

    public async getForUser(userId: number): Promise<IRole[]> {
        const response: HttpResponse<IRole[]> = await this._http.get<IRole[]>(`${RemoteRoleService._URL}/${userId}`, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 200) {
            return [];
        }

        return !!response.body ? response.body : [];
    }

    public async setForUser(userId: number, roles: IRole[]): Promise<void> {
        await this._http.put<any>(`${RemoteRoleService._URL}/${userId}`, roles.map((r) => r.id), {
            observe: 'response'
        }).toPromise();
    }

}
