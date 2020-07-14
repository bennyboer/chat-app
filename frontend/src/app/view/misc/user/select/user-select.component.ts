import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {UserService} from '../../../../connect/user/user.service';
import {IUser} from '../../../../model/user/user';
import {AuthService} from '../../../../connect/auth/auth.service';
import {UserDetailsService} from '../../../../connect/user/details/user-details.service';
import {IUserDetails} from '../../../../model/user/user-info';
import {ResourceService} from '../../../../connect/resource/resource.service';

/**
 * Component displaying a selection of one or mutliple users.
 */
@Component({
    selector: 'app-user-select-component',
    templateUrl: 'user-select.component.html',
    styleUrls: ['user-select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSelectComponent implements OnInit {

    /**
     * Current search value.
     */
    public searchValue: string;

    /**
     * Users to display.
     */
    public users: IUser[] = [];

    /**
     * Event emitter emitting selection changes.
     */
    @Output()
    public selectionChanges: EventEmitter<IUser[]> = new EventEmitter<IUser[]>();

    /**
     * Selected users.
     */
    private _selections: Set<number> = new Set<number>();

    /**
     * Currently authenticated user.
     */
    private _authUser: IUser;

    /**
     * Details of the users.
     */
    private _detailsLookup: Map<number, IUserDetails> = new Map<number, IUserDetails>();

    /**
     * Mapping of user IDs to their image.
     */
    private _userImageLookup: Map<number, string | ArrayBuffer> = new Map<number, string | ArrayBuffer>();

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _userService: UserService,
        private readonly _authService: AuthService,
        private readonly _userDetailsService: UserDetailsService,
        private readonly _resourceService: ResourceService
    ) {
    }

    /**
     * Called on initialization.
     */
    ngOnInit(): void {
        this._authUser = this._authService.getAuthenticatedUser();
        if (!this._authUser) {
            throw new Error('Currently authenticated user must to be defined');
        }

        this._refreshSearch('');
    }

    /**
     * Called when the search value changes.
     * @param value the new value
     */
    public onSearchValueChange(value: string): void {
        this.searchValue = value;

        this._refreshSearch(value);
    }

    /**
     * Get the current selection.
     */
    get selection(): number[] {
        return Array.from(this._selections.values());
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
    public getUserImage(user: IUser): string | ArrayBuffer | null {
        return this._userImageLookup.get(user.id);
    }

    /**
     * Get the current selection but with more detail.
     */
    get detailedSelection(): IUser[] {
        const lookup = new Map<number, IUser>();
        for (const user of this.users) {
            lookup.set(user.id, user);
        }

        return Array.from(this._selections.values()).map((id) => lookup.get(id));
    }

    /**
     * Get the current user.
     */
    get curUser(): IUser {
        return this._authUser;
    }

    /**
     * Get the user name of the passed user.
     * @param user to get name for
     */
    public getUserName(user: IUser): string {
        return `${user.firstName} ${user.lastName}`;
    }

    /**
     * Toggle selection for the passed user.
     * @param user to toggle selection for
     */
    public toggleSelection(user: IUser): void {
        if (this.isSelected(user)) {
            this._selections.delete(user.id);
        } else {
            this._selections.add(user.id);
        }

        this.selectionChanges.emit(this.detailedSelection);
    }

    /**
     * Check whether the passed user is selected.
     * @param user to check
     */
    public isSelected(user: IUser): boolean {
        return this._selections.has(user.id);
    }

    /**
     * Refresh the search with the passed search string.
     * @param searchStr to use for the search
     */
    private _refreshSearch(searchStr: string): void {
        this._userService.findUsers(searchStr).then((result) => result.filter((u) => u.id !== this._authUser.id)).then(async (users) => {
            this.users = users;

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
        });
    }

}
