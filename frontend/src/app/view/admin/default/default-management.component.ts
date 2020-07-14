import {ChangeDetectionStrategy, Component} from '@angular/core';

/**
 * Component shown as default content for the administration component router outlet.
 */
@Component({
    selector: 'app-default-management-component',
    templateUrl: 'default-management.component.html',
    styleUrls: ['default-management.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultManagementComponent {

}
