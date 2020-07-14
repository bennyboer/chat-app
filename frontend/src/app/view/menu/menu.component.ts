import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ThemeService} from '../../theme/theme.service';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {AuthService} from '../../connect/auth/auth.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {IUser} from '../../model/user/user';
import {UserService} from '../../connect/user/user.service';
import {UserDetailsService} from '../../connect/user/details/user-details.service';
import {IUserDetails} from '../../model/user/user-info';
import {ResourceService} from '../../connect/resource/resource.service';

/**
 * Root menu used to navigate between different components of the app.
 */
@Component({
    selector: 'app-menu-component',
    templateUrl: 'menu.component.html',
    styleUrls: ['menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit, OnDestroy {

    /**
     * Whether dark mode is enabled.
     */
    public isDarkMode = false;

    /**
     * User name to show in the menu.
     */
    public userName = '';

    /**
     * Image URL for the user image.
     */
    public userImage: string | ArrayBuffer | null = null;

    /**
     * Subscription to changes of the theme.
     */
    private _themeChangeSub: Subscription;

    /**
     * Subscription to authentication changes.
     */
    private _authChangeSub: Subscription;

    /**
     * Subscription to user changes.
     */
    private _userChangesSub: Subscription;

    /**
     * Subscription to user details changes.
     */
    private _userDetailsChangesSub: Subscription;

    /**
     * Currently authenticated user.
     */
    private _authUser: IUser | null = null;

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _themeService: ThemeService,
        private readonly _authService: AuthService,
        private readonly _userService: UserService,
        private readonly _userDetailsService: UserDetailsService,
        private readonly _resourceService: ResourceService,
        private readonly _router: Router,
        private readonly _snackBar: MatSnackBar
    ) {
    }

    /**
     * Called on component initialization.
     */
    ngOnInit(): void {
        this.isDarkMode = this._themeService.darkMode;
        this._themeChangeSub = this._themeService.changes.subscribe((darkMode) => {
            this.isDarkMode = darkMode;
        });

        this._onAuthUserChange(this._authService.getAuthenticatedUser());
        this._authChangeSub = this._authService.authChanges().subscribe((authUser) => {
            this._onAuthUserChange(authUser);
        });
        this._userChangesSub = this._userService.userChanges().subscribe((changedUser) => {
            if (!!this._authUser) {
                if (this._authUser.id === changedUser.id) {
                    this._onAuthUserChange(changedUser);
                }
            }
        });
        this._userDetailsChangesSub = this._userDetailsService.changes.subscribe((changedDetails) => {
            if (!!this._authUser) {
                if (this._authUser.id === changedDetails.userId) {
                    this._onAuthUserChange(this._authUser);
                }
            }
        });
    }

    /**
     * Called on a change of the authenticated user.
     * @param user which is currently authenticated
     */
    private _onAuthUserChange(user: IUser): void {
        this._authUser = user;

        if (!!user) {
            this.userName = `${this._authUser.firstName} ${this._authUser.lastName}`;

            this.userImage = null;

            // Load user details
            this._userDetailsService.get(user.id).catch(() => {
                return {
                    userID: user.id,
                } as IUserDetails;
            }).then(async (details) => {
                if (!!details.imageId) {
                    this.userImage = await this._resourceService.loadImage(details.imageId);

                    this._cd.markForCheck();
                }
            });
        } else {
            this.userName = '';
            this.userImage = null;
        }

        this._cd.markForCheck();
    }

    /**
     * Called on component destruction.
     */
    ngOnDestroy(): void {
        this._themeChangeSub.unsubscribe();
        this._authChangeSub.unsubscribe();
        this._userChangesSub.unsubscribe();
        this._userDetailsChangesSub.unsubscribe();
    }

    /**
     * Called on theme change.
     * @param event which occurred
     */
    public onThemeChange(event: MatSlideToggleChange) {
        this._themeService.darkMode = !this._themeService.darkMode;
    }

    /**
     * Called when the user should be logged out.
     */
    public async onLogout(): Promise<void> {
        const authUser = this._authService.getAuthenticatedUser();
        if (!authUser) {
            throw new Error('Authenticated user must be present');
        }

        if (await this._authService.signOut()) {
            this._snackBar.open(`See you ${authUser.firstName} ${authUser.lastName}!`, null, {
                duration: 3000,
                verticalPosition: 'bottom'
            });

            await this._router.navigate(['/login']);
        }
    }

}
