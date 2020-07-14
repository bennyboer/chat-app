import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationButtonService} from './service/navigation-button.service';
import {Observable, Subscription} from 'rxjs';

/**
 * Component displaying a button used for mobile navigation.
 */
@Component({
    selector: 'app-navigation-button-component',
    templateUrl: 'navigation-button.component.html',
    styleUrls: ['navigation-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationButtonComponent implements OnInit, OnDestroy {

    /**
     * Icon name changes observable.
     */
    public iconName: string;

    /**
     * Subscription to icon name changes.
     */
    private _iconNameSub: Subscription;

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _service: NavigationButtonService) {
    }

    /**
     * Called on component initialization.
     */
    ngOnInit(): void {
        this._iconNameSub = this._service.iconChanges.subscribe((newIconName) => {
            this.iconName = newIconName;
            this._cd.detectChanges();
        });
    }

    /**
     * Called on component destruction.
     */
    ngOnDestroy(): void {
        this._iconNameSub.unsubscribe();
    }

    /**
     * When the navigation button has been clicked.
     */
    public onClick(): void {
        this._service.runNext();
    }

}
