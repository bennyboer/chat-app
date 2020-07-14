import {RoleService} from './role.service';
import {IRole} from '../../../model/auth/role';
import {Injectable} from '@angular/core';

/**
 * Role service only working with local resource.
 */
@Injectable()
export class LocalStorageRoleService extends RoleService {

    private static readonly _ROLES = [
        {
            id: 1,
            name: 'user'
        },
        {
            id: 2,
            name: 'admin'
        }
    ];

    /**
     * Temporary roles (serving as dummy).
     */
    private _tmpRoles: Map<number, IRole[]> = new Map<number, IRole[]>();

    constructor() {
        super();

        this._tmpRoles.set(42, LocalStorageRoleService._ROLES);
    }


    public async getAll(): Promise<IRole[]> {
        return LocalStorageRoleService._ROLES;
    }

    public async getForUser(userId: number): Promise<IRole[]> {
        if (this._tmpRoles.has(userId)) {
            return this._tmpRoles.get(userId);
        }

        return [];
    }

    public async setForUser(userId: number, roles: IRole[]): Promise<void> {
        roles = roles.map((r) => LocalStorageRoleService._ROLES.find((rr) => rr.id === r.id));
        this._tmpRoles.set(userId, roles);
    }

}
