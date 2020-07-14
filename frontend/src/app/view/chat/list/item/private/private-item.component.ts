import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {IChat} from '../../../../../model/chat/chat';
import {ChatListService} from '../../service/chat-list.service';
import {AuthService} from '../../../../../connect/auth/auth.service';
import {IUser} from '../../../../../model/user/user';

/**
 * Component displaying the chat list item for a private chat (With only one user).
 */
@Component({
    selector: 'app-private-item-component',
    templateUrl: 'private-item.component.html',
    styleUrls: ['private-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivateItemComponent {

    /**
     * Chat to display item for.
     */
    @Input()
    public chat: IChat;

    constructor(
        private readonly _authService: AuthService,
        private readonly _chatListService: ChatListService
    ) {
    }

    /**
     * Get the chat image URL.
     */
    public get chatImage(): string | ArrayBuffer {
        return this._chatListService.getChatImage(this.chat.id);
    }

    /**
     * Get the chat name (the other members name).
     */
    public get chatName(): string {
        if (this.chat.members.length === 1) {
            return this.chat.name; // When only one member is left in the chat
        }

        const authUser: IUser = this._authService.getAuthenticatedUser();

        for (const member of this.chat.members) {
            if (member.id !== authUser.id) {
                return `${member.firstName} ${member.lastName}`;
            }
        }
    }

}
