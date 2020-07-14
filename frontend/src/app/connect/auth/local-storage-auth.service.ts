import {Injectable} from '@angular/core';
import {AuthService} from './auth.service';
import {IUser} from '../../model/user/user';
import {Observable, Subject} from 'rxjs';
import {UserService} from '../user/user.service';
import {RoleService} from './role/role.service';

/**
 * Service used to authenticate a profile.
 */
@Injectable()
export class LocalStorageAuthService extends AuthService {

    /**
     * Key of local storage used to determine if a user is logged in.
     */
    private static readonly LOCAL_STORAGE_LOGGED_IN_KEY = 'test.logged_in';

    /**
     * Default username to authenticate with.
     */
    private static readonly DEFAULT_USERNAME = 'admin';

    /**
     * Default password to authenticate with.
     */
    private static readonly DEFAULT_PASSWORD = 'admin';

    /**
     * Whether user is authenticated.
     */
    private _authenticated = false;

    /**
     * Currently authenticated user.
     */
    private _authUser: IUser | null = null;

    /**
     * Lookup for roles of the currently authenticated user.
     */
    private _authUserRolesLookup: Set<string> = new Set<string>();

    /**
     * Subject notifying of authentication events.
     */
    private _authSubject: Subject<IUser | null> = new Subject<IUser | null>();

    /**
     * Whether the service is initialized (authenticated user and roles are loaded).
     */
    private _initialized = false;

    constructor(
        private readonly _userService: UserService,
        private readonly _roleService: RoleService
    ) {
        super();

        this._loadAuthenticatedUser();
    }

    /**
     * Load the currently authenticated user (if any).
     */
    private async _loadAuthenticatedUser(): Promise<void> {
        this._authenticated = (localStorage.getItem(LocalStorageAuthService.LOCAL_STORAGE_LOGGED_IN_KEY) ?? 'false') === 'true';
        if (this._authenticated) {
            this._authUser = await this._userService.getUser(42); // Load authenticated user
            if (!!this._authUser) {
                const roles = await this._roleService.getForUser(this._authUser.id); // Load roles
                for (const role of roles) {
                    this._authUserRolesLookup.add(role.name);
                }

                this._initialized = true;
                this._authSubject.next(this.getAuthenticatedUser());
                return;
            }
        }

        this._initialized = true;
        this._authSubject.next(null);
    }

    public async authenticate(username: string, password: string): Promise<boolean> {
        if (username === LocalStorageAuthService.DEFAULT_USERNAME
            && password === LocalStorageAuthService.DEFAULT_PASSWORD) {
            this._authenticated = true;
            localStorage.setItem(LocalStorageAuthService.LOCAL_STORAGE_LOGGED_IN_KEY, String(true));

            // Load authenticated user
            this._authUser = await this._userService.getUser(42);

            // Load user roles
            this._authUserRolesLookup.clear();
            const roles = await this._roleService.getForUser(this._authUser.id);
            for (const role of roles) {
                this._authUserRolesLookup.add(role.name);
            }

            this._authSubject.next(this.getAuthenticatedUser());
        }

        return this.isAuthenticated();
    }

    public async signOut(): Promise<boolean> {
        this._authenticated = false;
        localStorage.setItem(LocalStorageAuthService.LOCAL_STORAGE_LOGGED_IN_KEY, String(false));
        this._authUser = null;
        this._authSubject.next(null);
        return true;
    }

    public async signUp(user: IUser): Promise<boolean> {
        const newUser = await this._userService.createUser(user);
        await this._roleService.setForUser(newUser.id, [{
            id: 1
        }]);
        return true;
    }

    public getAuthenticatedUser(): IUser | null {
        return this._authUser;
    }

    public hasRight(roles: string[]): boolean {
        return this.isAuthenticated() ? roles.findIndex((role) => this._authUserRolesLookup.has(role)) > -1 : false;
    }

    public isAuthenticated(): boolean {
        return this._authenticated;
    }

    public authChanges(): Observable<IUser | null> {
        return this._authSubject.asObservable();
    }

    public isInitialized(): boolean {
        return this._initialized;
    }

}
