import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

/**
 * Component containing the main app navigation.
 */
@Component({
    selector: 'app-navigation-component',
    templateUrl: 'navigation.component.html',
    styleUrls: ['navigation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class NavigationComponent {

}
