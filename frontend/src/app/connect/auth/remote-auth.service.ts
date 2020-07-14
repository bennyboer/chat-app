import {Injectable} from '@angular/core';
import {AuthService} from './auth.service';
import {IUser} from '../../model/user/user';
import {Observable, Subject} from 'rxjs';
import {JwtHelperService} from '@auth0/angular-jwt';
import {UserService} from '../user/user.service';
import {HttpClient, HttpResponse} from '@angular/common/http';

/**
 * Service used to authenticate a profile.
 */
@Injectable()
export class RemoteAuthService extends AuthService {

    /**
     * Key the JSON web token is stored under in local storage.
     */
    private static readonly _LOCALSTORAGE_JWT_KEY = 'auth.jwt';

    /**
     * URL to the API.
     */
    private static readonly _API_URL = '/api';

    /**
     * URL to the authenticate service.
     */
    private static readonly _AUTHENTICATE_URL = 'authenticate';

    /**
     * URL to the register service.
     */
    private static readonly _SIGNUP_URL = 'auth/register';

    /**
     * Header containing the token.
     */
    public static readonly _TOKEN_HEADER = 'Authorization';

    /**
     * The current JSON web token.
     */
    private _token: string = null;

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
        private readonly _jwtHelper: JwtHelperService,
        private readonly _userService: UserService,
        private readonly _http: HttpClient
    ) {
        super();

        this._token = RemoteAuthService.getToken();

        this._loadAuthenticatedUser();
    }

    /**
     * Get the JSON web token (if any) from local storage.
     */
    public static getToken(): string {
        return localStorage.getItem(RemoteAuthService._LOCALSTORAGE_JWT_KEY);
    }

    /**
     * Clear the JSON web token in local storage (if any).
     */
    public static clearToken(): void {
        localStorage.removeItem(RemoteAuthService._LOCALSTORAGE_JWT_KEY);
    }

    /**
     * Save the passed JSON web token in local storage.
     */
    public static saveToken(token: string): void {
        localStorage.setItem(RemoteAuthService._LOCALSTORAGE_JWT_KEY, token);
    }

    /**
     * Load the currently authenticated user (if any).
     */
    private async _loadAuthenticatedUser(): Promise<void> {
        if (this.isAuthenticated()) {
            this._authUser = await this._userService.getMe().catch(() => {
                return null;
            }); // Load authenticated user
            if (!!this._authUser) {
                const roles = this._jwtHelper.decodeToken(this._token).roles;
                this._authUserRolesLookup.clear();
                for (const role of roles) {
                    this._authUserRolesLookup.add(role);
                }

                this._initialized = true;
                this._authSubject.next(this.getAuthenticatedUser());
                return;
            } else {
                this._token = null;
                RemoteAuthService.clearToken();
            }
        }

        this._initialized = true;
        this._authSubject.next(null);
    }

    public async authenticate(username: string, password: string): Promise<boolean> {
        if (this.isAuthenticated()) {
            return true;
        }

        try {
            const response: HttpResponse<any> = await this._http.get(`${RemoteAuthService._API_URL}/${RemoteAuthService._AUTHENTICATE_URL}?username=${username}&password=${password}`, {
                observe: 'response',
            }).toPromise();

            if (response.status !== 200) {
                return false;
            }

            let token = response.headers.get(RemoteAuthService._TOKEN_HEADER);
            if (!!token) {
                token = token.split(' ')[1]; // Remove Prefix "Bearer "
                RemoteAuthService.saveToken(token);
                this._token = token;

                await this._loadAuthenticatedUser();
                return this.isAuthenticated();
            }

            return false;
        } catch (e) {
            return false;
        }
    }

    public async signOut(): Promise<boolean> {
        RemoteAuthService.clearToken();
        this._token = null;

        this._authUser = null;
        this._authUserRolesLookup.clear();
        this._authSubject.next(null);

        return true;
    }

    public async signUp(user: IUser): Promise<boolean> {
        const response: HttpResponse<any> = await this._http.post<any>(`${RemoteAuthService._API_URL}/${RemoteAuthService._SIGNUP_URL}`, user, {
            observe: 'response'
        }).toPromise();

        return response.status === 200;
    }

    public getAuthenticatedUser(): IUser | null {
        return this._authUser;
    }

    public hasRight(roles: string[]): boolean {
        return this.isAuthenticated() ? roles.findIndex((role) => this._authUserRolesLookup.has(role)) > -1 : false;
    }

    public isAuthenticated(): boolean {
        return !!this._token ? !this._jwtHelper.isTokenExpired(this._token) : false;
    }

    public authChanges(): Observable<IUser | null> {
        return this._authSubject.asObservable();
    }

    public isInitialized(): boolean {
        return this._initialized;
    }

}
