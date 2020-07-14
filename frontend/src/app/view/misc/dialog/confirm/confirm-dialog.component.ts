import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

/**
 * Dialog component used to confirm things.
 */
@Component({
    selector: 'app-confirm-dialog-component',
    templateUrl: 'confirm-dialog.component.html',
    styleUrls: ['confirm-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {

    constructor(
        private readonly _dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public readonly data: IConfirmDialogData
    ) {
    }

    /**
     * When yes has been clicked.
     */
    public onYes(): void {
        this._dialogRef.close(true);
    }

    /**
     * When no has been clicked.
     */
    public onNo(): void {
        this._dialogRef.close(false);
    }

}

/**
 * Data for the confirm dialog.
 */
export interface IConfirmDialogData {

    /**
     * Message to show.
     */
    message: string;

}
