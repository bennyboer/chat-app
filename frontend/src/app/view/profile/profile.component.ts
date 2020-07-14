import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild
} from '@angular/core';
import {AuthService} from '../../connect/auth/auth.service';
import {UserService} from '../../connect/user/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {IUser} from '../../model/user/user';
import {ENTER, ESCAPE} from '@angular/cdk/keycodes';
import {IUserDetails} from '../../model/user/user-info';
import {UserDetailsService} from '../../connect/user/details/user-details.service';
import {MatDialog} from '@angular/material/dialog';
import {AvatarUploadDialogComponent} from './avatar-upload-dialog/avatar-upload-dialog.component';
import {ResourceService} from '../../connect/resource/resource.service';

/**
 * Component used to manage a users profile.
 */
@Component({
    selector: 'app-profile-component',
    templateUrl: 'profile.component.html',
    styleUrls: ['profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {

    /**
     * Whether the user name is currently edited.
     */
    public editUserName = false;

    /**
     * Whether the status is currently edited.
     */
    public editStatus = false;

    /**
     * Currently authenticated user.
     */
    private _authUser: IUser;

    /**
     * The users image.
     */
    private _userImage: string | ArrayBuffer | null = null;

    /**
     * Additional info about the currently authenticated user.
     */
    private _userDetails: IUserDetails;

    /**
     * Edit field for the user name.
     */
    @ViewChild('userNameEditField')
    public userNameEditField: ElementRef;

    /**
     * Edit field for the users status.
     */
    @ViewChild('statusEditField')
    public statusEditField: ElementRef;

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _authService: AuthService,
        private readonly _userService: UserService,
        private readonly _userDetailsService: UserDetailsService,
        private readonly _resourceService: ResourceService,
        private readonly _snackBar: MatSnackBar,
        private readonly _matDialog: MatDialog
    ) {
    }

    /**
     * Get the ID of the user to show profile for.
     */
    public get userId(): number {
        return this._authUser.id;
    }

    /**
     * Called on component initialization.
     */
    ngOnInit(): void {
        this._authUser = this._authService.getAuthenticatedUser();

        this._userDetailsService.get(this._authUser.id).catch(() => {
            // User details do not yet exist.
            return {
                userId: this._authUser.id,
                status: ''
            } as IUserDetails;
        }).then(async (details) => {
            this._userDetails = details;

            await this._refreshUserImage();

            this._cd.markForCheck();
        });
    }

    /**
     * Refresh the current users image.
     */
    private async _refreshUserImage(): Promise<void> {
        if (!!this._userDetails.imageId) {
            this._userImage = await this._resourceService.loadImage(this._userDetails.imageId);
        } else {
            this._userImage = null;
        }
    }

    /**
     * Get the currently authenticated user name.
     */
    get userName(): string {
        return !!this._authUser ? `${this._authUser.firstName} ${this._authUser.lastName}` : 'Loading...';
    }

    /**
     * Get status of the currently authenticated user.
     */
    get status(): string {
        return !!this._userDetails ? this._userDetails.status : 'Loading...';
    }

    /**
     * Check whether the user has an image.
     */
    get hasImage(): boolean {
        return !!this._userImage;
    }

    /**
     * Get the users image.
     */
    get userImage(): string | ArrayBuffer | null {
        return this._userImage;
    }

    /**
     * Edit the user name.
     */
    public startEditUserName(): void {
        this.editUserName = true;
    }

    /**
     * Edit the users status.
     */
    public startEditStatus(): void {
        this.editStatus = true;
    }

    /**
     * Called on window click.
     * @param event which occurred
     */
    @HostListener('window:click', ['$event'])
    public onWindowClick(event: MouseEvent): void {
        const editableElementClicked = !!(event.target as HTMLElement).closest('[contentEditable="true"]');
        if (!editableElementClicked) {
            this._leaveEditModes(true);
        }
    }

    /**
     * Called on window keydown.
     * @param event which occurred
     */
    @HostListener('window:keydown', ['$event'])
    public onWindowKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === ENTER) {
            event.preventDefault();
            this._leaveEditModes(true);
        } else if (event.keyCode === ESCAPE) {
            event.preventDefault();
            this._leaveEditModes(false);
        }
    }

    /**
     * Called when the avatar should be edited.
     */
    public onEditAvatar(): void {
        const dialogRef = this._matDialog.open(AvatarUploadDialogComponent, {
            width: '300px',
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            const resourceId = result;

            if (!resourceId) {
                this._snackBar.open('Could not upload avatar', 'Got it!', {
                    duration: 5000,
                    verticalPosition: 'bottom'
                });
                return;
            }

            this._userDetails.imageId = resourceId;

            // Update user details
            const success = await this._userDetailsService.update(this._userDetails);
            if (!success) {
                this._snackBar.open('Could not update the user details with the new image', 'Got it!', {
                    duration: 5000,
                    verticalPosition: 'bottom'
                });
            } else {
                this._snackBar.open('Successfully updated profile picture!', 'Got it!', {
                    duration: 3000,
                    verticalPosition: 'bottom'
                });

                await this._refreshUserImage();
                this._cd.markForCheck();
            }
        });
    }

    /**
     * Leave all edit modes.
     * @param save whether to save values
     */
    private _leaveEditModes(save: boolean): void {
        this._leaveUserNameEditMode(save);
        this._leaveStatusEditMode(save);
    }

    /**
     * Leave the user name edit mode.
     * @param save whether to save the new value
     */
    private _leaveUserNameEditMode(save: boolean): void {
        if (this.editUserName) {
            this.editUserName = false;

            if (save) {
                const newValue = this.userNameEditField.nativeElement.textContent.trim();
                if (newValue.length > 1) {
                    const parts = newValue.split(' ');
                    this._userService.updateUser({
                        id: this._authUser.id,
                        email: this._authUser.email,
                        firstName: parts[0],
                        lastName: parts.length > 1 ? parts.splice(1, parts.length - 1).join(' ') : ''
                    }).then(async (success) => {
                        if (success) {
                            this._authUser = this._authService.getAuthenticatedUser();
                            this._snackBar.open('User name has been updated successfully!', 'Got it!', {
                                duration: 3000,
                                verticalPosition: 'bottom'
                            });

                            this._cd.markForCheck();
                        } else {
                            this._snackBar.open('Could not update user name', 'Got it!', {
                                duration: 5000,
                                verticalPosition: 'bottom'
                            });

                            // Reset value
                            this.userNameEditField.nativeElement.textContent = this.userName;
                        }
                    });
                } else {
                    // Reset value
                    this.userNameEditField.nativeElement.textContent = this.userName;
                }
            } else {
                // Reset value
                this.userNameEditField.nativeElement.textContent = this.userName;
            }
        }
    }

    /**
     * Leave the status edit mode.
     * @param save whether to save the new value
     */
    private _leaveStatusEditMode(save: boolean): void {
        if (this.editStatus) {
            this.editStatus = false;

            if (save) {
                const newValue = this.statusEditField.nativeElement.textContent.trim();
                if (newValue.length > 1) {
                    this._userDetails.status = newValue;

                    this._userDetailsService.update(this._userDetails).then(async (success) => {
                        if (success) {
                            this._authUser = this._authService.getAuthenticatedUser();
                            this._snackBar.open('User status has been updated successfully!', 'Got it!', {
                                duration: 3000,
                                verticalPosition: 'bottom'
                            });

                            this._cd.markForCheck();
                        } else {
                            this._snackBar.open('Could not update user status', 'Got it!', {
                                duration: 5000,
                                verticalPosition: 'bottom'
                            });

                            // Reset value
                            this.statusEditField.nativeElement.textContent = this.status;
                        }
                    });
                } else {
                    // Reset value
                    this.statusEditField.nativeElement.textContent = this.status;
                }
            } else {
                // Reset value
                this.statusEditField.nativeElement.textContent = this.status;
            }
        }
    }

}
