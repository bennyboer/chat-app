import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {ChatService} from '../../../../connect/chat/chat.service';
import {IUser} from '../../../../model/user/user';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {NgForm} from '@angular/forms';
import {IChat} from '../../../../model/chat/chat';
import {UserDetailsService} from '../../../../connect/user/details/user-details.service';
import {IUserDetails} from '../../../../model/user/user-info';
import {ResourceService} from '../../../../connect/resource/resource.service';
import {MatSnackBar} from '@angular/material/snack-bar';

/**
 * Dialog component showing chat information.
 */
@Component({
    selector: 'app-chat-info-dialog-component',
    templateUrl: 'chat-info-dialog.component.html',
    styleUrls: ['chat-info-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatInfoDialogComponent implements OnInit {

    /**
     * Chat to display data over.c
     */
    private _chat: IChat;

    /**
     * The chats participant details.
     */
    private _participantDetails: Map<number, IUserDetails> = new Map<number, IUserDetails>();

    /**
     * Whether info has been loaded.
     */
    public loaded: boolean = false;

    /**
     * Mapping of user IDs to their image.
     */
    private _userImageLookup: Map<number, string | ArrayBuffer> = new Map<number, string | ArrayBuffer>();

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _chatService: ChatService,
        private readonly _userDetailsService: UserDetailsService,
        private readonly _resourceService: ResourceService,
        private readonly _snackBar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) public readonly data: IChatInfoDialogData
    ) {
    }

    /**
     * Get the chats name.
     */
    public get chatName() {
        return this._chat.name;
    }
    
    /**
    * Set the chats name
    */
    public set chatName(name: String) {
        let nameWrapper = name as string;
        this._chat.name = nameWrapper;
    }

    /**
     * Get the chats participants.
     */
    public get participants() {
        return this._chat.members;
    }

    /**
     * Get user details for the passed user ID.
     * @param userId to get details for
     */
    public getUserDetails(userId: number): IUserDetails {
        return this._participantDetails.get(userId);
    }

    /**
     * Get the passed users user name.
     * @param user to get name of
     */
    public getUserName(user: IUser): string {
        return `${user.firstName} ${user.lastName}`;
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
     * Check whether we have user details for the passed users ID.
     * @param userId to check for details
     */
    public hasUserDetails(userId: number): boolean {
        return !!this._participantDetails.get(userId);
    }

    /**
     * Called on component initialization.
     */
    public ngOnInit(): void {
        this._load();
    }

    /**
     * Load the component data.
     */
    private async _load(): Promise<void> {
        this._chat = await this._loadChat();
        const details = await this._loadParticipantsInfo(this._chat.members);

        this._participantDetails.clear();
        this._userImageLookup.clear();
        for (const d of details) {
            this._participantDetails.set(d.userId, d);

            if (!!d.imageId) {
                this._userImageLookup.set(d.userId, await this._resourceService.loadImage(d.imageId));
            }
        }

        this.loaded = true;

        this._cd.markForCheck();
    }

    /**
     * Load the chat to display info over.
     */
    private async _loadChat(): Promise<IChat> {
        return this._chatService.getForId(this.data.chatId);
    }

    /**
     * Load the chats participants info.
     * @param participants to fetch additional infos for
     */
    private async _loadParticipantsInfo(participants: IUser[]): Promise<IUserDetails[]> {
        return this._userDetailsService.getBatch(participants.map((u) => u.id));
    }

    /**
     * When the form is being submitted.
     * @param form to submit
     */
    public updateChat() {
        if (this.participants.length >= 1) {
            this._chatService.update({
                id: this._chat.id,
                name: this._chat.name,
                owner: this._chat.owner,
                members: this._chat.members
            } as IChat);
        } else {
            if (this._chat.name.length < 1) {
                this._snackBar.open('Please specify the chat name', 'Got it!', {
                    duration: 5000,
                    verticalPosition: 'bottom'
                });
            } else if (this.participants.length < 1) {
                this._snackBar.open('Please select at least one chat partner', 'Got it!', {
                    duration: 5000,
                    verticalPosition: 'bottom'
                });
            }
        }
    }

}

/**
 * Data needed by the chat info dialog.
 */
export interface IChatInfoDialogData {

    /**
     * Id of the chat to show info for.
     */
    chatId: number;

}
