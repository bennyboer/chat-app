import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {UserService} from '../../../connect/user/user.service';
import {IUser} from '../../../model/user/user';
import {UserDetailsService} from '../../../connect/user/details/user-details.service';
import {IUserDetails} from '../../../model/user/user-info';
import {ResourceService} from '../../../connect/resource/resource.service';

/**
 * Management component for users.
 */
@Component({
    selector: 'app-user-management-component',
    templateUrl: 'user-management.component.html',
    styleUrls: ['user-management.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent implements OnInit {

    /**
     * List of all users.
     */
    public users: IUser[] = [];

    /**
     * Details of the users.
     */
    private _detailsLookup: Map<number, IUserDetails> = new Map<number, IUserDetails>();

    /**
     * Lookup of images for the specific users.
     */
    private _userImageLookup: Map<number, string | ArrayBuffer> = new Map<number, string | ArrayBuffer>();

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _userService: UserService,
        private readonly _userDetailsService: UserDetailsService,
        private readonly _resourceService: ResourceService
    ) {
    }

    /**
     * Called on component initialization.
     */
    public ngOnInit(): void {
        this._refreshUserList();
    }

    /**
     * Called when the search value is updated.
     * @param value the updated value
     */
    public onSearchValueUpdate(value: string): void {
        this._refreshUserList(value);
    }

    /**
     * Check whether the passed user has an image.
     * @param user to check for an image
     */
    public hasImage(user: IUser): boolean {
        return this._userImageLookup.has(user.id);
    }

    /**
     * Get the image for the passed user.
     * @param user to fetch image for
     */
    public getUserImage(user: IUser): string | ArrayBuffer {
        return this._userImageLookup.get(user.id);
    }

    /**
     * Refresh the user list.
     * @param filter to apply
     */
    private async _refreshUserList(filter: string = ''): Promise<void> {
        this.users = await this._userService.findUsers(filter);

        // Load user details.
        const details = await this._userDetailsService.getBatch(this.users.map(u => u.id));
        this._detailsLookup.clear();
        this._userImageLookup.clear();
        for (const detail of details) {
            this._detailsLookup.set(detail.userId, detail);

            if (!!detail.imageId) {
                this._userImageLookup.set(detail.userId, await this._resourceService.loadImage(detail.imageId));
            }
        }

        this._cd.markForCheck();
    }

}
