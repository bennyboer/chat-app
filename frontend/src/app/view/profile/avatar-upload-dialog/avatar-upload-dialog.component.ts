import {ChangeDetectionStrategy, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {NgForm} from '@angular/forms';
import {ResourceService} from '../../../connect/resource/resource.service';

/**
 * Component used to upload a new avatar.
 */
@Component({
    selector: 'app-avatar-upload-dialog-component',
    templateUrl: 'avatar-upload-dialog.component.html',
    styleUrls: ['avatar-upload-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarUploadDialogComponent {

    /**
     * The file input element.
     */
    @ViewChild('fileInput', {read: ElementRef})
    public fileInput: ElementRef;

    constructor(
        private readonly _dialogRef: MatDialogRef<AvatarUploadDialogComponent>,
        private readonly _resourceService: ResourceService
    ) {
    }

    /**
     * When the upload button has been pressed.
     */
    public onSubmit(form: NgForm): void {
        const files = this.fileInput.nativeElement.files;
        if (files.length === 0) {
            return;
        }

        const formData = new FormData();
        formData.append('file', files[0]);

        this._resourceService.upload(formData).then((result) => {
            this._dialogRef.close(result);
        });
    }

}
