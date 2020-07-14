import {Injectable} from '@angular/core';
import {IChat} from '../../../../model/chat/chat';
import {UserDetailsService} from '../../../../connect/user/details/user-details.service';
import {AuthService} from '../../../../connect/auth/auth.service';
import {IUser} from '../../../../model/user/user';
import {ResourceService} from '../../../../connect/resource/resource.service';

/**
 * Service for the chat list communication.
 */
@Injectable()
export class ChatListService {

    /**
     * Lookup for chat images.
     */
    private _chatImageLookup: Map<number, string | ArrayBuffer> = new Map<number, string | ArrayBuffer>();

    constructor(
        private readonly _authService: AuthService,
        private readonly _userDetailsService: UserDetailsService,
        private readonly _resourceService: ResourceService
    ) {
    }

    /**
     * Set the current chats.
     * @param chats to set
     */
    public async setChats(chats: IChat[]): Promise<void> {
        this._chatImageLookup.clear();

        const authUser: IUser = this._authService.getAuthenticatedUser();

        const privateChatUserIdToChatId: Map<number, number> = new Map<number, number>();
        for (const chat of chats) {
            if (chat.members.length === 2) {
                let otherMemberId: number = null;
                for (const member of chat.members) {
                    if (member.id !== authUser.id) {
                        otherMemberId = member.id;
                        break;
                    }
                }

                if (!!otherMemberId) {
                    privateChatUserIdToChatId.set(otherMemberId, chat.id);
                }
            }
        }

        // Load user images for private chat members (non-group chats).
        const details = await this._userDetailsService.getBatch(Array.from(privateChatUserIdToChatId.keys()));
        for (const detail of details) {
            if (!!detail.imageId) {
                this._chatImageLookup.set(privateChatUserIdToChatId.get(detail.userId), await this._resourceService.loadImage(detail.imageId));
            }
        }
    }

    /**
     * Get the chat image for the passed chat ID.
     * @param chatId of the chat to get image for
     */
    public getChatImage(chatId: number): string | ArrayBuffer | null {
        return this._chatImageLookup.get(chatId);
    }

}
