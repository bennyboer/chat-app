import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthService} from '../../connect/auth/auth.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {ThemeService} from '../../theme/theme.service';
import {Subscription} from 'rxjs';

/**
 * Component used to login as user.
 */
@Component({
    selector: 'app-login-component',
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {

    /**
     * Whether dark mode is enabled.
     */
    public isDarkMode = false;

    /**
     * Whether a sign in is in progress.
     */
    private _siginingIn = false;

    /**
     * Subscription to changes of the theme.
     */
    private _themeChangeSub: Subscription;

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _authService: AuthService,
        private readonly _router: Router,
        private readonly _snackBar: MatSnackBar,
        private readonly _themeService: ThemeService
    ) {
    }

    /**
     * Called on component initialization.
     */
    public ngOnInit(): void {
        if (this._authService.isAuthenticated()) {
            this._router.navigate(['/chat']);
        }

        this.isDarkMode = this._themeService.darkMode;
        this._themeChangeSub = this._themeService.changes.subscribe((darkMode) => {
            this.isDarkMode = darkMode;
        });
    }

    /**
     * Called on component destruction.
     */
    public ngOnDestroy(): void {
        this._themeChangeSub.unsubscribe();
    }

    /**
     * On submit of the form.
     * @param form to submit
     */
    public async onSubmit(form: NgForm): Promise<void> {
        if (form.valid) {
            const email = form.value.email;
            const password = form.value.password;

            this._siginingIn = true;
            this._cd.markForCheck();

            if (await this._authService.authenticate(email, password)) {
                const authUser = this._authService.getAuthenticatedUser();
                if (!authUser) {
                    throw new Error('User has been successfully authenticated still the application cannot get the authenticated user');
                }

                this._snackBar.open(`Welcome ${authUser.firstName} ${authUser.lastName}`, null, {
                    duration: 3000,
                    verticalPosition: 'bottom'
                });

                await this._router.navigate(['/chat']);
            } else {
                this._siginingIn = false;
                this._cd.markForCheck();

                this._snackBar.open('Invalid credentials supplied', 'Got it!', {
                    duration: 3000,
                    verticalPosition: 'bottom'
                });
            }
        } else {
            this._snackBar.open('Please specify both username and password!', 'Got it!', {
                duration: 5000,
                verticalPosition: 'bottom'
            });
        }
    }

    /**
     * Whether currently signing in.
     */
    public isSigningIn(): boolean {
        return this._siginingIn;
    }

    /**
     * Called on theme change.
     * @param event which occurred
     */
    public onThemeChange(event: MatSlideToggleChange) {
        this._themeService.darkMode = !this._themeService.darkMode;
    }

}
