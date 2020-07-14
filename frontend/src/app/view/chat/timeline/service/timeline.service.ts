import {Injectable} from '@angular/core';
import {IChat} from '../../../../model/chat/chat';
import {IUserDetails} from '../../../../model/user/user-info';
import {UserDetailsService} from '../../../../connect/user/details/user-details.service';
import {ResourceService} from '../../../../connect/resource/resource.service';

/**
 * Inter component communication service for the timeline component.
 */
@Injectable()
export class TimelineService {

    /**
     * Details of the users.
     */
    private _detailsLookup: Map<number, IUserDetails> = new Map<number, IUserDetails>();

    /**
     * Lookup of user images by their ID.
     */
    private _userImageLookup: Map<number, string | ArrayBuffer> = new Map<number, string | ArrayBuffer>();

    constructor(
        private readonly _userDetailsService: UserDetailsService,
        private readonly _resourceService: ResourceService
    ) {
    }

    /**
     * Initialize service for the passed chat.
     * @param chat to initialize service for
     */
    public async initForChat(chat: IChat): Promise<void> {
        const details = await this._userDetailsService.getBatch(chat.members.map(u => u.id));
        this._detailsLookup.clear();
        this._userImageLookup.clear();
        for (const detail of details) {
            this._detailsLookup.set(detail.userId, detail);

            if (!!detail.imageId) {
                this._userImageLookup.set(detail.userId, await this._resourceService.loadImage(detail.imageId));
            }
        }
    }

    /**
     * Get a user image for the passed user ID (if user has one).
     * @param userId to get image for
     */
    public getUserImage(userId: number): string | ArrayBuffer | null {
        return this._userImageLookup.get(userId);
    }

}
