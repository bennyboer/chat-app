import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {IResourceInfo} from '../../../model/resource/resource-info';
import {ResourceService} from '../../../connect/resource/resource.service';
import {IUser} from '../../../model/user/user';
import {UserService} from '../../../connect/user/user.service';

/**
 * Component used to manage application resources.
 */
@Component({
    selector: 'app-resource-management-component',
    templateUrl: 'resource-management.component.html',
    styleUrls: ['resource-management.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceManagementComponent implements OnInit {

    /**
     * Currently displayed columns.
     */
    public displayedColumns: string[] = ['resourceID', 'size', 'contentType', 'originalName', 'owner', 'action'];

    /**
     * Resource infos to display.
     */
    public resourceInfos: IResourceInfo[] = [];

    /**
     * Lookup of users by their ID.
     */
    private _userLookup: Map<number, IUser> = new Map<number, IUser>();

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _userService: UserService,
        private readonly _resourceService: ResourceService
    ) {
    }

    /**
     * Called on component initialization.
     */
    public ngOnInit(): void {
        this._refreshResourceInfos();
    }

    /**
     * Get the name of the resource owner.
     * @param ownerId to get the name for
     */
    public getOwnerName(ownerId: number): string {
        const user = this._userLookup.get(ownerId);
        if (!!user) {
            return `${user.firstName} ${user.lastName}`;
        }

        return '';
    }

    /**
     * Called when resource deletion is requested.
     * @param info to delete resource for
     */
    public onDeleteResource(info: IResourceInfo): void {
        this._resourceService.remove(info.resourceId).finally(() => {
            this._refreshResourceInfos();
        });
    }

    /**
     * Refresh the resource infos displayed.
     */
    private async _refreshResourceInfos(): Promise<void> {
        this.resourceInfos = await this._resourceService.getAll();

        const neededUserIds: Set<number> = new Set<number>();
        for (const info of this.resourceInfos) {
            neededUserIds.add(info.ownerId);
        }

        const neededUserIdsList = Array.from(neededUserIds.values());
        const users = await this._userService.getBatch(neededUserIdsList);
        this._userLookup.clear();
        for (const user of users) {
            this._userLookup.set(user.id, user);
        }

        this._cd.markForCheck();
    }

}
