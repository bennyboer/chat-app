import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../connect/user/user.service';
import {NgForm} from '@angular/forms';
import {IUser} from '../../../model/user/user';
import {IRole} from '../../../model/auth/role';
import {RoleService} from '../../../connect/auth/role/role.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent, IConfirmDialogData} from '../../misc/dialog/confirm/confirm-dialog.component';

/**
 * Component used to edit a user.
 */
@Component({
    selector: 'app-edit-user-component',
    templateUrl: 'edit-user.component.html',
    styleUrls: ['edit-user.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditUserComponent implements OnInit, OnDestroy {

    /**
     * Subscription to route parameter changes.
     */
    private _paramSub: Subscription;

    /**
     * User to edit.
     */
    private _user: IUser;

    /**
     * The user edit form.
     */
    @ViewChild(NgForm, {static: true})
    public form: NgForm;

    /**
     * All available roles.
     */
    public availableRoles: IRole[] = [];

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _userService: UserService,
        private readonly _roleService: RoleService,
        private readonly _route: ActivatedRoute,
        private readonly _snackBar: MatSnackBar,
        private readonly _router: Router,
        private readonly _dialogService: MatDialog
    ) {
    }


    /**
     * Called on component initialization.
     */
    public ngOnInit(): void {
        this._refreshRoles();

        this._paramSub = this._route.paramMap.subscribe(async (params) => {
            const userId: number = parseInt(params.get('id'), 10);

            this._initForUser(userId);
        });
    }

    /**
     * Called on component destruction.
     */
    public ngOnDestroy(): void {
        this._paramSub.unsubscribe();
    }

    /**
     * Initialize the component for the passed user ID.
     * @param userId to init component for
     */
    private async _initForUser(userId: number): Promise<void> {
        this._user = await this._userService.getUser(userId);
        const roles = await this._roleService.getForUser(userId);

        this.form.setValue({
            email: this._user.email,
            firstName: this._user.firstName,
            lastName: this._user.lastName,
            password: '',
            roles: roles.map((r) => r.id)
        });

        this._cd.markForCheck();
    }

    /**
     * Refresh the available roles list.
     */
    private async _refreshRoles(): Promise<void> {
        this.availableRoles = await this._roleService.getAll();
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
            const roles: IRole[] = !!form.value.roles ? form.value.roles.map((value: string) => {
                return {id: parseInt(value, 10)} as IRole;
            }) : [];

            const success = await this._userService.updateUser({
                id: this._user.id,
                email,
                firstName,
                lastName,
                password: !!password && password.length > 0 ? password : null
            });
            if (!success) {
                this._snackBar.open('User could not be edited', 'Got it!', {
                    duration: 5000,
                    verticalPosition: 'bottom'
                });
                return;
            }

            // Update roles
            await this._roleService.setForUser(this._user.id, roles);

            this._snackBar.open('User successfully edited', 'Got it!', {
                duration: 3000,
                verticalPosition: 'bottom'
            });

            await this._router.navigate(['/admin', 'user']);
        }
    }

    /**
     * Callen when the delete button has been clicked.
     */
    public async onDelete(): Promise<void> {
        const dialogRef = this._dialogService.open(ConfirmDialogComponent, {
            data: {
                message: 'Do you really want to delete this user?'
            } as IConfirmDialogData
        });

        const result: boolean = await dialogRef.afterClosed().toPromise();
        if (result) {
            const success = await this._userService.deleteUser(this._user.id);
            if (success) {
                this._snackBar.open('Successfully deleted the user!', 'Got it!', {
                    duration: 3000,
                    verticalPosition: 'bottom'
                });
                await this._router.navigate(['/admin', 'user']);
            } else {
                this._snackBar.open('Could not delete the user', 'Got it!', {
                    duration: 5000,
                    verticalPosition: 'bottom'
                });
            }
        }
    }

}
