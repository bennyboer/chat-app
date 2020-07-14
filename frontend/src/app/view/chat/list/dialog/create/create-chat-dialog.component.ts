import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {NgForm} from '@angular/forms';
import {UserSelectComponent} from '../../../../misc/user/select/user-select.component';
import {ChatService} from '../../../../../connect/chat/chat.service';
import {IChat} from '../../../../../model/chat/chat';
import {MatSnackBar} from '@angular/material/snack-bar';
import {IUser} from '../../../../../model/user/user';

/**
 * Dialog component to create a new chat.
 */
@Component({
    selector: 'app-create-chat-dialog-component',
    templateUrl: 'create-chat-dialog.component.html',
    styleUrls: ['create-chat-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateChatDialogComponent {

    /**
     * Form currently edited.
     */
    @ViewChild('form')
    public form: NgForm;

    /**
     * Component used to select users in the chat.
     */
    @ViewChild(UserSelectComponent)
    public userSelect: UserSelectComponent;

    /**
     * The last generated chat name.
     */
    private _lastGeneratedChatName: string;

    constructor(
        private readonly _dialogRef: MatDialogRef<CreateChatDialogComponent>,
        private readonly _chatService: ChatService,
        private readonly _snackBar: MatSnackBar
    ) {
    }

    /**
     * Called when the selected participants change.
     * @param participants current participants
     */
    public onParticipantsChange(participants: IUser[]): void {
        let generatedChatName = '';
        if (participants.length === 1) {
            generatedChatName = `${participants[0].firstName} ${participants[0].lastName}`;
        } else if (participants.length > 1) {
            for (const p of participants) {
                generatedChatName += p.lastName.charAt(0).toUpperCase();
            }
        }

        const chatName: string = this.form.value.name;
        if (chatName.length === 0 || chatName === this._lastGeneratedChatName) {
            this._lastGeneratedChatName = generatedChatName;
            this.form.controls.name.setValue(generatedChatName);
        }
    }

    /**
     * When the form is being submitted.
     * @param form to submit
     */
    public onSubmit(form: NgForm) {
        if (form.valid && this.userSelect.selection.length >= 1) {
            this._dialogRef.close({
                id: -1,
                name: form.value.name,
                owner: this.userSelect.curUser,
                members: this.userSelect.detailedSelection
            } as IChat);
        } else {
            if (!form.valid) {
                this._snackBar.open('Please specify the chat name', 'Got it!', {
                    duration: 5000,
                    verticalPosition: 'bottom'
                });
            } else if (this.userSelect.selection.length < 1) {
                this._snackBar.open('Please select at least one chat partner', 'Got it!', {
                    duration: 5000,
                    verticalPosition: 'bottom'
                });
            }
        }
    }

}
