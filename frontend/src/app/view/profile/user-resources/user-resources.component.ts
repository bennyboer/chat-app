import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {ResourceService} from '../../../connect/resource/resource.service';
import {UserDetailsService} from '../../../connect/user/details/user-details.service';
import {AuthService} from '../../../connect/auth/auth.service';
import {IUserDetails} from '../../../model/user/user-info';
import {IResourceInfo} from '../../../model/resource/resource-info';
import {IUser} from '../../../model/user/user';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent, IConfirmDialogData} from '../../misc/dialog/confirm/confirm-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {IImageDialogData, ImageDialogComponent} from '../../misc/dialog/image/image-dialog.component';

/**
 * Component displaying a users resources.
 */
@Component({
    selector: 'app-user-resources-component',
    templateUrl: 'user-resources.component.html',
    styleUrls: ['user-resources.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserResourcesComponent {

    /**
     * The current user image (if any).
     */
    public userImage: IResourceItem | null = null;

    /**
     * Other resources (except the user image).
     */
    public otherResources: IResourceItem[] = [];

    /**
     * ID of the user to display resources for.
     */
    private _userId: number;

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _authService: AuthService,
        private readonly _userDetailsService: UserDetailsService,
        private readonly _resourceService: ResourceService,
        private readonly _dialog: MatDialog,
        private readonly _snackBar: MatSnackBar
    ) {
    }

    /**
     * Get the ID of the user to display resources for.
     */
    get userId(): number {
        return this._userId;
    }

    /**
     * Set the ID of the user to display resources for.
     * @param value the user ID
     */
    @Input()
    set userId(value: number) {
        this._userId = value;

        this._refreshResources();
    }

    /**
     * Refresh the displayed resources.
     */
    private async _refreshResources(): Promise<void> {
        // Fetch all resources owned by the currently authenticated user.
        let infos: IResourceInfo[] = await this._resourceService.getForUser(this._userId);

        // Find user details to find the profile image (if user has one).
        const details: IUserDetails = await this._userDetailsService.get(this._userId).catch(() => {
            return {
                imageId: null,
                userId: this._userId,
                status: ''
            } as IUserDetails;
        });
        if (!!details.imageId) {
            // Find user image resource info
            infos = infos.filter((i) => i.resourceId !== details.imageId);

            this.userImage = {
                info: infos.find((i) => i.resourceId === details.imageId),
                image: await this._resourceService.loadImage(details.imageId)
            };
        }

        this.otherResources.length = infos.length;
        for (let i = 0; i < infos.length; i++) {
            const info = infos[i];

            this.otherResources[i] = {
                info,
                image: await this._resourceService.loadImage(info.resourceId)
            };
        }

        this._cd.markForCheck();
    }

    /**
     * Called when the passed item should be deleted.
     * @param item to delete
     */
    public onDelete(item: IResourceItem): void {
        const dialogRef = this._dialog.open(ConfirmDialogComponent, {
            data: {
                message: 'Do you really want to delete that resource?'
            } as IConfirmDialogData
        });

        dialogRef.afterClosed().subscribe(async (doDelete) => {
            if (doDelete) {
                const success = await this._resourceService.remove(item.info.resourceId);
                if (success) {
                    this._snackBar.open('Successfully deleted resource', 'Got it!', {
                        duration: 3000,
                        verticalPosition: 'bottom'
                    });
                } else {
                    this._snackBar.open('Could not delete resource', 'Got it!', {
                        duration: 5000,
                        verticalPosition: 'bottom'
                    });
                }

                await this._refreshResources();
            }
        });
    }

    /**
     * Convert the passed timestamp to a date string.
     * @param timestamp to convert
     */
    public timestampToDateStr(timestamp: number): string {
        const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
        return new Date(timestamp).toLocaleDateString(undefined, options);
    }

    /**
     * Called when the passed item should be shown fullscreen.
     * @param item to show fullscreen
     */
    public onShow(item: IResourceItem): void {
        this._dialog.open(ImageDialogComponent, {
            data: {
                image: item.image
            } as IImageDialogData
        });
    }

}

/**
 * Resource item to display in the component.
 */
interface IResourceItem {

    /**
     * Info about the resource.
     */
    info: IResourceInfo;

    /**
     * Image of the resource.
     */
    image?: string | ArrayBuffer;

}
