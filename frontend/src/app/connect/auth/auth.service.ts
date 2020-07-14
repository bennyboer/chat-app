import {IUser} from '../../model/user/user';
import {Observable} from 'rxjs';

/**
 * Service used for authentication purposes.
 */
export abstract class AuthService {

    /**
     * Authenticate a user.
     * @param username to authenticate with
     * @param password to authenticate with
     */
    abstract async authenticate(username: string, password: string): Promise<boolean>;

    /**
     * Sign the current user out (if any signed in).
     * Returns whether successfully logged out.
     */
    abstract async signOut(): Promise<boolean>;

    /**
     * Sign up a new user.
     * @param user to sign up
     */
    abstract async signUp(user: IUser): Promise<boolean>;

    /**
     * Check if a user is currently authenticated.
     */
    abstract isAuthenticated(): boolean;

    /**
     * Get the currently authenticated user.
     */
    abstract getAuthenticatedUser(): IUser | null;

    /**
     * Check if the currently authenticated user (if any) has on of the specified roles.
     */
    abstract hasRight(roles: string[]): boolean;

    /**
     * Changes of authenticated users.
     * May emit null values if no user is authenticated.
     */
    abstract authChanges(): Observable<IUser | null>;

    /**
     * Whether the service is initialized (authenticated user and roles loaded).
     */
    abstract isInitialized(): boolean;

}
