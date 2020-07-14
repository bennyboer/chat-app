import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {IMessage} from '../../../../model/chat/message';
import {IUser} from '../../../../model/user/user';
import {TimelineService} from '../service/timeline.service';
import {ResourceService} from '../../../../connect/resource/resource.service';
import {MatDialog} from '@angular/material/dialog';
import {IImageDialogData, ImageDialogComponent} from '../../../misc/dialog/image/image-dialog.component';

/**
 * Component displaying a single message of a chat.
 */
@Component({
    selector: 'app-message-component',
    templateUrl: 'message.component.html',
    styleUrls: ['message.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageComponent {

    /**
     * Message to display.
     */
    private _msg: IMessage;

    /**
     * Loaded image if the message type is image.
     */
    private _loadedImage: string | ArrayBuffer | null = null;

    /**
     * Image information if message type is image.
     */
    private _imageInfo: { id: string, dimensions: { width: number, height: number } } | null = null;

    /**
     * User who sent the message.
     */
    @Input()
    public user: IUser;

    /**
     * Whether the currently authenticated user it the author.
     */
    @Input()
    public isAuthUser: boolean;

    /**
     * Whether the chat is a group chat.
     */
    @Input()
    public isGroupChat: boolean;

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _timelineService: TimelineService,
        private readonly _resourceService: ResourceService,
        private readonly _dialog: MatDialog
    ) {
    }

    get msg(): IMessage {
        return this._msg;
    }

    @Input()
    set msg(value: IMessage) {
        this._msg = value;

        if (value.type === 'IMAGE') {
            this._imageInfo = JSON.parse(value.content);

            this._resourceService.loadImage(this._imageInfo.id).then((result) => {
                this._loadedImage = result;
                this._cd.markForCheck();
            }, (error) => {
                // Image could not be loaded. Probably is deleted. Do nothing.
                this._loadedImage = null;
            });
        }
    }

    /**
     * Show the image fullscreen (if message is an image).
     */
    public showImageFullscreen(): void {
        this._dialog.open(ImageDialogComponent, {
            data: {
                image: this._loadedImage
            } as IImageDialogData
        });
    }

    /**
     * Get the image dimensions (if message type is image).
     */
    public get dimensions(): { width: number, height: number } {
        return this._imageInfo.dimensions;
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
     * Get the user name for the passed user.
     * @param user to get name for
     */
    public getUserName(user: IUser): string {
        return `${user.firstName} ${user.lastName}`;
    }

    /**
     * Get an image.
     */
    public getImage(): string | ArrayBuffer | null {
        return this._loadedImage;
    }

    /**
     * Check whether the user has an image.
     * @param userId to check for an image
     */
    public hasImage(userId: number): boolean {
        return !!this._timelineService.getUserImage(userId);
    }

    /**
     * Get the image for the passed user ID.
     * @param userId to get image for
     */
    public getUserImage(userId: number): string | ArrayBuffer | null {
        return this._timelineService.getUserImage(userId);
    }

    /**
     * Estimate the image height.
     * @param imageContainer to estimate image height width
     */
    public estimateImageHeight(imageContainer: HTMLElement): number {
        const containerWidth = imageContainer.clientWidth;

        if (this.dimensions.width > containerWidth) {
            const aspectRatio = this.dimensions.width / this.dimensions.height;
            return containerWidth / aspectRatio;
        } else {
            return this.dimensions.height;
        }
    }

}
