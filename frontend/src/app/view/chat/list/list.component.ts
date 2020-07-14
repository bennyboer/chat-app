import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ChatService} from '../../../connect/chat/chat.service';
import {IChat} from '../../../model/chat/chat';
import {MatDialog} from '@angular/material/dialog';
import {CreateChatDialogComponent} from './dialog/create/create-chat-dialog.component';
import {AuthService} from '../../../connect/auth/auth.service';
import {IUser} from '../../../model/user/user';
import {ChatListService} from './service/chat-list.service';
import {ChatComponentService} from '../service/chat-component.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

/**
 * Component displaying a list of chats (group, and private chats).
 */
@Component({
    selector: 'app-list-component',
    templateUrl: 'list.component.html',
    styleUrls: ['list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

    /**
     * Chats to display.
     */
    public chats: IChat[];

    /**
     * Currently authenticated user.
     */
    private _user: IUser;

    /**
     * Subscription to chats changed events.
     */
    private _chatsChangedSub: Subscription;

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _authService: AuthService,
        private readonly _chatService: ChatService,
        private readonly _dialog: MatDialog,
        private readonly _chatListService: ChatListService,
        private readonly _chatComponentService: ChatComponentService,
        private readonly _router: Router
    ) {
    }

    /**
     * On component initialization.
     */
    public ngOnInit(): void {
        this._user = this._authService.getAuthenticatedUser();
        if (!this._user) {
            throw new Error('User is not authenticated');
        }

        this._chatsChangedSub = this._chatComponentService.getChatsChangedObservable().subscribe(() => {
            this._refreshList();
        });

        this._refreshList();
    }

    /**
     * Called on component destruction.
     */
    public ngOnDestroy(): void {
        this._chatsChangedSub.unsubscribe();
    }

    /**
     * Refresh the chat list.
     */
    private async _refreshList(): Promise<void> {
        this.chats = await this._chatService.getAll(this._user.id);
        await this._chatListService.setChats(this.chats);
        this._cd.markForCheck();
    }

    /**
     * Check whether the passed chat is a group chat.
     * @param chat to check
     */
    public isGroupChat(chat: IChat): boolean {
        return chat.members.length > 2;
    }

    /**
     * Check whether the passed chat is private.
     * @param chat to check
     */
    public isPrivateChat(chat: IChat): boolean {
        return chat.members.length <= 2;
    }

    /**
     * Called when the add button has been clicked.
     */
    public onAddChat(): void {
        const dialogRef = this._dialog.open(CreateChatDialogComponent);
        dialogRef.afterClosed().subscribe((result) => {
            if (!!result) {
                const chat = result as IChat;
                this._chatService.create(this._user.id, chat).then(async (newId) => {
                    await this._refreshList();
                    await this._router.navigate(['/chat', `${newId}`]);
                });
            }
        });
    }

}
