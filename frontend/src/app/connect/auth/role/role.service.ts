import {IRole} from '../../../model/auth/role';

/**
 * Service used to manage roles.
 */
export abstract class RoleService {

    /**
     * Get all available roles.
     */
    abstract async getAll(): Promise<IRole[]>;

    /**
     * Get roles for the passed user ID.
     * @param userId to get roles for
     */
    abstract async getForUser(userId: number): Promise<IRole[]>;

    /**
     * Set roles for the passed user.
     * @param userId to set roles for
     * @param roles to set
     */
    abstract async setForUser(userId: number, roles: IRole[]): Promise<void>;

}
