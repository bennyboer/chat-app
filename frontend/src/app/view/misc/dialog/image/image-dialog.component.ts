import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

/**
 * Dialog component used to display images.
 */
@Component({
    selector: 'app-image-dialog-component',
    templateUrl: 'image-dialog.component.html',
    styleUrls: ['image-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageDialogComponent {

    constructor(
        private readonly _dialogRef: MatDialogRef<ImageDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public readonly data: IImageDialogData
    ) {
    }

}

/**
 * Data for the image dialog.
 */
export interface IImageDialogData {

    /**
     * Image to display.
     */
    image: string | ArrayBuffer;

}
