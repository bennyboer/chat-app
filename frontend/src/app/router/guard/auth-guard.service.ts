import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable, OnDestroy} from '@angular/core';
import {AuthService} from '../../connect/auth/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable, Subscription} from 'rxjs';
import {first, map} from 'rxjs/operators';

/**
 * Service guarding routes that need an authenticated user.
 */
@Injectable()
export class AuthGuardService implements CanActivate {

    constructor(
        private readonly _authService: AuthService,
        private readonly _router: Router,
        private readonly _snackBar: MatSnackBar
    ) {
    }

    public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        if (!this._authService.isInitialized()) {
            await this._authService.authChanges().pipe(first()).toPromise(); // Wait until initialized
        }

        if (this._authService.isAuthenticated()) {
            if (!!route.data.roles) {
                // Route can only be accessed if the user has the correct roles
                const canAccess = this._authService.hasRight(route.data.roles);

                if (canAccess) {
                    return true;
                } else {
                    this._snackBar.open('You have not enough rights to access this resource', 'Got it!', {
                        duration: 5000,
                        verticalPosition: 'bottom'
                    });
                    await this._router.navigate(['/']);
                    return false;
                }
            }

            return true;
        } else {
            this._snackBar.open('You need to login first!', 'Got it!', {
                duration: 5000,
                verticalPosition: 'bottom'
            });
            await this._router.navigate(['/login'], {replaceUrl: true});
            return false;
        }
    }

}
