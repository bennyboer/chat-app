import {ChangeDetectionStrategy, Component, HostBinding, Input, OnInit} from '@angular/core';
import {MessageService} from '../../../connect/message/message.service';
import {AuthService} from '../../../connect/auth/auth.service';
import {IUser} from '../../../model/user/user';
import {ResourceService} from '../../../connect/resource/resource.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent, IConfirmDialogData} from '../../misc/dialog/confirm/confirm-dialog.component';
import {IUserResourcesDialogData, UserResourcesDialogComponent} from '../../profile/user-resources/dialog/user-resources-dialog.component';
import {fromEvent} from 'rxjs';
import {first} from 'rxjs/operators';

/**
 * Component letting the user type in and send a new message.
 */
@Component({
    selector: 'app-input-component',
    templateUrl: 'input.component.html',
    styleUrls: ['input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent implements OnInit {

    /**
     * ID of the chat to send something to.
     */
    @Input()
    public chatId: number;

    /**
     * Currently authenticated user.
     */
    private _authUser: IUser;

    /**
     * Class activated when user is dragging over component.
     */
    @HostBinding('class.drag-over')
    public isDragOver = false;

    constructor(
        private readonly _authService: AuthService,
        private readonly _messageService: MessageService,
        private readonly _resourceService: ResourceService,
        private readonly _dialog: MatDialog
    ) {
    }

    /**
     * On component initialization.
     */
    public ngOnInit(): void {
        this._authUser = this._authService.getAuthenticatedUser();
    }

    /**
     * Called on image upload.
     */
    public onImageUpload(fileInput: HTMLInputElement): void {
        fileInput.dispatchEvent(new MouseEvent('click'));

        fromEvent(document, 'change').pipe(first()).subscribe(async () => {
            const files = fileInput.files;
            if (files.length === 0) {
                return;
            }

            this._uploadImage(files[0]);
        });
    }

    /**
     * When to submit the form.
     */
    public onSubmit(textField: HTMLInputElement) {
        const value = textField.value;

        if (!!value && value.length > 0) {
            this._messageService.send(this.chatId, this._authUser.id, value, 'TEXT');
        }

        textField.value = '';
    }

    /**
     * Called on drop.
     * @param event which occurred
     */
    public onDrop(event: DragEvent): void {
        event.preventDefault();
        this.isDragOver = false;

        const file = event.dataTransfer.files[0];
        this._uploadImage(file);
    }

    /**
     * Upload the passed image file.
     * @param file to upload
     */
    private _uploadImage(file: File): void {
        this._getDimensionsForImage(file).then((dimensions) => {
            const formData = new FormData();
            formData.append('file', file);

            this._resourceService.upload(formData).then((result) => {
                this._messageService.send(this.chatId, this._authUser.id, JSON.stringify({
                    id: result,
                    dimensions
                }), 'IMAGE');
            }, (error) => {
                if (error.status === 403 && error.error === 'User exceeded maximum file count for uploads') {
                    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
                        data: {
                            message: 'You have reached the file upload limit. Do you want to delete some files first?'
                        } as IConfirmDialogData
                    });

                    dialogRef.afterClosed().subscribe((doDelete) => {
                        if (doDelete) {
                            this._dialog.open(UserResourcesDialogComponent, {
                                data: {
                                    userId: this._authUser.id
                                } as IUserResourcesDialogData
                            });
                        }
                    });
                } else {
                    throw new Error(error.error);
                }
            });
        });
    }

    /**
     * Fetch the dimensions for the passed image file.
     * @param imageFile to get dimensions of
     */
    private async _getDimensionsForImage(imageFile: File): Promise<{ width: number, height: number }> {
        const imgSrc = await this._resourceService.loadImageFromBlob(imageFile);

        const img = document.createElement('img');
        img.src = imgSrc as string;

        return await new Promise((resolve, reject) => {
            img.onerror = () => {
                reject(new Error('Could not render image'));
            };

            img.onload = () => {
                resolve({
                    width: img.width,
                    height: img.height
                });
            };
        });
    }

    /**
     * Called on drag leave.
     * @param event which occurred
     */
    public onDragExit(event: Event): void {
        this.isDragOver = false;
    }

    /**
     * Called on drag leave.
     * @param event which occurred
     */
    public onDragOver(event: DragEvent): void {
        event.preventDefault();
        this.isDragOver = true;
    }

}
