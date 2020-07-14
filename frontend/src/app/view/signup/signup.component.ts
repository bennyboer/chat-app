import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthService} from '../../connect/auth/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';

/**
 * Component used to sign up a new user.
 */
@Component({
    selector: 'app-signup-component',
    templateUrl: 'signup.component.html',
    styleUrls: ['signup.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent {

    constructor(
        private readonly _authService: AuthService,
        private readonly _snackBar: MatSnackBar,
        private readonly _router: Router
    ) {
    }

    /**
     * Called on form submission.
     * @param form to submit
     */
    public async onSubmit(form: NgForm): Promise<void> {
        if (form.valid) {
            const email = form.value.email;
            const firstName = form.value.firstName;
            const lastName = form.value.lastName;
            const password = form.value.password;

            const success = await this._authService.signUp({
                id: -1,
                email,
                firstName,
                lastName,
                password,
            });

            if (success) {
                this._snackBar.open('Successfully signed up!', 'Got it!', {
                    duration: 5000,
                    verticalPosition: 'bottom'
                });

                await this._router.navigate(['/']);
            } else {
                this._snackBar.open('An error occurred during sign up', 'Got it!', {
                    duration: 5000,
                    verticalPosition: 'bottom'
                });
            }
        }
    }

}
