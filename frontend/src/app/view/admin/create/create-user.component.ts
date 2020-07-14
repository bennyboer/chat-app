import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {UserService} from '../../../connect/user/user.service';
import {RoleService} from '../../../connect/auth/role/role.service';
import {IRole} from '../../../model/auth/role';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';

/**
 * Component used to create a user.
 */
@Component({
    selector: 'app-create-user-component',
    templateUrl: 'create-user.component.html',
    styleUrls: ['create-user.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateUserComponent implements OnInit {

    /**
     * All available roles.
     */
    public availableRoles: IRole[] = [];

    constructor(
        private readonly _userService: UserService,
        private readonly _roleService: RoleService,
        private readonly _snackBar: MatSnackBar,
        private readonly _router: Router
    ) {
    }

    /**
     * Called on component initialization.
     */
    public ngOnInit(): void {
        this._refreshRoles();
    }

    /**
     * Refresh the available roles list.
     */
    private async _refreshRoles(): Promise<void> {
        this.availableRoles = await this._roleService.getAll();
    }

    /**
     * When the form has been submitted.
     * @param form to submit
     */
    public async onSubmit(form: NgForm): Promise<void> {
        if (form.valid) {
            const email = form.value.email;
            const firstName = form.value.firstName;
            const lastName = form.value.lastName;
            const password = form.value.password;
            const roles: IRole[] = !!form.value.roles ? form.value.roles.map((value: string) => {
                return {id: parseInt(value, 10)} as IRole;
            }) : [];

            const newUser = await this._userService.createUser({
                id: -1,
                email,
                firstName,
                lastName,
                password
            });
            if (!newUser) {
                this._snackBar.open('User could not be created', 'Got it!', {
                    duration: 5000,
                    verticalPosition: 'bottom'
                });
                return;
            }

            // Set roles
            await this._roleService.setForUser(newUser.id, roles);

            this._snackBar.open('User successfully created', 'Got it!', {
                duration: 3000,
                verticalPosition: 'bottom'
            });

            await this._router.navigate(['/admin', 'user']);
        }
    }

}
