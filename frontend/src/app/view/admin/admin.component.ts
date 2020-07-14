import {ChangeDetectionStrategy, Component} from '@angular/core';

/**
 * Administration component.
 */
@Component({
    selector: 'app-admin-component',
    templateUrl: 'admin.component.html',
    styleUrls: ['admin.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent {

}
