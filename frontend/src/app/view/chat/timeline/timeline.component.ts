import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ChatService} from '../../../connect/chat/chat.service';
import {MessageService} from '../../../connect/message/message.service';
import {Subscription} from 'rxjs';
import {IMessage} from '../../../model/chat/message';
import {IChat} from '../../../model/chat/chat';
import {IUser} from '../../../model/user/user';
import {AuthService} from '../../../connect/auth/auth.service';
import {VirtualScrollerComponent} from 'ngx-virtual-scroller';
import {CreateChatDialogComponent} from '../list/dialog/create/create-chat-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {ChatComponentService} from '../service/chat-component.service';
import {TimelineService} from './service/timeline.service';
import {UserService} from '../../../connect/user/user.service';
import {ChatListService} from '../list/service/chat-list.service';
import {ChatInfoDialogComponent, IChatInfoDialogData} from '../dialog/chat-info-dialog/chat-info-dialog.component';

/**
 * Component displaying messages of a chat in a timeline.
 */
@Component({
    selector: 'app-timeline-component',
    templateUrl: 'timeline.component.html',
    styleUrls: ['timeline.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TimelineService]
})
export class TimelineComponent implements OnInit, OnDestroy {

    /**
     * ID of the currently shown chat.
     */
    public chatId: number;

    /**
     * Number of the current page of the current chat
     */
    public chatPage: number;

    /**
     *
     */
    public reachedCurrentChatEnd: boolean;

    /**
     * Messages to show.
     */
    public messages: IMessage[] = [];

    /**
     * Subscription to new messages.
     */
    private _messageSub: Subscription;

    /**
     * Subscription to route parameter changes.
     */
    private _paramSub: Subscription;

    /**
     * Chat model to display messages for.
     */
    private _chat: IChat;

    /**
     * Currently authenticated user.
     */
    private _user: IUser;

    /**
     * Users that participate in the chat.
     */
    private _users: Map<number, IUser>;

    /**
     * The scroll component of the timeline.
     */
    @ViewChild(VirtualScrollerComponent)
    public scroller: VirtualScrollerComponent;

    /**
     * Show the placeholder in case no chat is selected.
     */
    public showPlaceholder = true;

    /**
     * Whether the chat is currently loading.
     */
    public isLoading = true;

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _route: ActivatedRoute,
        private readonly _userService: UserService,
        private readonly _authService: AuthService,
        private readonly _chatService: ChatService,
        private readonly _messageService: MessageService,
        private readonly _router: Router,
        private readonly _dialog: MatDialog,
        private readonly _chatComponentService: ChatComponentService,
        private readonly _timelineService: TimelineService,
        private readonly _chatListService: ChatListService
    ) {
    }

    /**
     * Get the chat name.
     */
    get chatName(): string {
        return !!this._chat ? this._chat.name : '';
    }

    /**
     * Get the chat image URL.
     */
    public get chatImage(): string | ArrayBuffer {
        return this._chatListService.getChatImage(this._chat.id);
    }

    /**
     * Get user by ID.
     * @param id of the user to get
     */
    public getUser(id: number): IUser {
        return this._users.get(id);
    }

    /**
     * Whether the passed user is the currently authenticated user.
     * @param id to check
     */
    public isAuthUser(id: number): boolean {
        return id === this._user.id;
    }

    /**
     * Check whether the current chat is a group chat.
     */
    public isGroupChat(): boolean {
        return this._chat.members.length > 1;
    }

    public async fetchMore(event): Promise<void> {
        if (!this.reachedCurrentChatEnd && event.startIndex === 1) {
            this.chatPage += 1;
            if (!!this.chatId) {
                const loadedMessages = await this._messageService.getAll(this.chatId, this.chatPage)
                    .then((messages) => this._checkMessagesForUnseenUsers(messages));
                if (loadedMessages.length === 0) {
                    this.chatPage -= 1;
                    this.reachedCurrentChatEnd = true;
                } else {
                    const startIndex = this.scroller.viewPortInfo.startIndex;
                    const count = loadedMessages.length;
                    this.messages = loadedMessages.concat(this.messages);
                    this.scroller.scrollToIndex(startIndex + count);
                }
            }
        }
    }

    /**
     * Called on chat creation.
     */
    public onCreateChat(): void {
        const dialogRef = this._dialog.open(CreateChatDialogComponent);
        dialogRef.afterClosed().subscribe((result) => {
            if (!!result) {
                const chat = result as IChat;
                this._chatService.create(this._user.id, chat).then(async (newId) => {
                    this._chatComponentService.notifyChatsChanged();
                    await this._router.navigate(['/chat', `${newId}`]);
                });
            }
        });
    }

    /**
     * On component initialization.
     */
    ngOnInit(): void {
        this._paramSub = this._route.paramMap.subscribe(async (params) => {
            this._user = this._authService.getAuthenticatedUser();
            if (!this._user) {
                throw new Error('User is not authenticated');
            }

            this.isLoading = true;
            this.showPlaceholder = false;
            this._cd.markForCheck();

            let chatId: number = parseInt(params.get('id'), 10);
            if (!chatId) {
                // Select first chat in list
                const chats = await this._chatService.getAll(this._user.id);
                if (chats.length > 0) {
                    chatId = chats[0].id;
                    await this._onChatChange(chatId);
                } else {
                    this.showPlaceholder = true;
                }
            } else {
                await this._onChatChange(chatId);
            }

            this.isLoading = false;
            this._cd.markForCheck();
        });
    }

    /**
     * On component destruction.
     */
    ngOnDestroy(): void {
        this._paramSub.unsubscribe();
        if (!!this._messageSub) {
            this._messageSub.unsubscribe();
        }
    }

    /**
     * Scroll to the last visible message.
     */
    private _scrollToLastMessage() {
        this.scroller.scrollToIndex(this.messages.length - 1);
    }

    /**
     * Get the current chat to display.
     */
    public get chat(): IChat | null {
        return this._chat;
    }

    /**
     * Called when the delete button has been pressed.
     */
    public onDelete(): void {
        this._chatService.remove(this._chat.id).finally(() => {
            this._chatComponentService.notifyChatsChanged();
            this._router.navigate(['/']);
        });
    }

    /**
     * When the chat changes.
     * @param id of the chat
     */
    private async _onChatChange(id: number): Promise<boolean> {
        this.chatId = id;
        this._chat = await this._chatService.getForId(id);

        // Check if currently authenticated user is participant of the chat
        let userIsParticipant = false;
        for (const member of this._chat.members) {
            if (member.id === this._user.id) {
                userIsParticipant = true;
                break;
            }
        }

        if (!userIsParticipant) {
            return false;
        }

        this._users = new Map<number, IUser>();
        for (const user of this._chat.members) {
            this._users.set(user.id, user);
        }
        this._users.set(this._user.id, this._user);

        if (!!this._messageSub) {
            this._messageSub.unsubscribe();
        }

        this.chatPage = 0;
        this.messages = await this._messageService.getAll(id, this.chatPage)
            .then((messages) => this._checkMessagesForUnseenUsers(messages));
        this._messageSub = this._messageService.changes(id).subscribe((newMsg) => {
            this._onNewMessage(newMsg);
        });

        await this._timelineService.initForChat(this._chat);

        this.reachedCurrentChatEnd = false;
        this._scrollToLastMessage();

        return true;
    }

    /**
     * Check the passed messages whether we
     * have all users mentioned currently loaded.
     * This might not be the case when a user left the chat but there are still
     * messages he's the author of.
     * @param messages to check
     */
    private async _checkMessagesForUnseenUsers(messages: IMessage[]): Promise<IMessage[]> {
        for (const msg of messages) {
            if (!this._users.has(msg.authorId)) {
                // Couldn't find the author in the message in the already loaded lookup -> load from server
                this._users.set(msg.authorId, await this._userService.getUser(msg.authorId));
            }
        }

        return messages;
    }

    /**
     * When a new message occurs.
     * @param msg which occurred
     */
    private _onNewMessage(msg: IMessage) {
        this.messages.push(msg);

        if (this.scroller.viewPortInfo.endIndex === this.messages.length - 2) {
            this._scrollToLastMessage();
        }

        this._cd.markForCheck();
    }

    /**
     * Called when the chat label has been clicked.
     * @param event that occurred
     */
    public onChatLabelClicked(event: MouseEvent): void {
        this._dialog.open(ChatInfoDialogComponent, {
            data: {
                chatId: this._chat.id
            } as IChatInfoDialogData
        }).afterClosed().subscribe(async () => {
            await this._onChatChange(this._chat.id);
            this._cd.markForCheck();
        });
    }

}
