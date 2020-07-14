import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {IImageDialogData} from '../../../misc/dialog/image/image-dialog.component';

/**
 * Dialog showing the user resources component.
 */
@Component({
    selector: 'app-user-resources-dialog-component',
    templateUrl: 'user-resources-dialog.component.html',
    styleUrls: ['user-resources-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserResourcesDialogComponent {

    constructor(
        private readonly _dialogRef: MatDialogRef<UserResourcesDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public readonly data: IUserResourcesDialogData
    ) {
    }

}

/**
 * Data for the user resources dialog.
 */
export interface IUserResourcesDialogData {

    /**
     * User ID to show dialog for.
     */
    userId: number;

}
