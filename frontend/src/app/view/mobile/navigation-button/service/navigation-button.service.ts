import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {Observable, Subject} from 'rxjs';

/**
 * Service used to communicate with the navigation button.
 */
@Injectable({
    providedIn: 'root'
})
export class NavigationButtonService implements OnDestroy {

    /**
     * List of actions held by the service.
     */
    private _actions: INavigationAction[] = [];

    /**
     * List of open actions held by the service.
     */
    private _openActions: INavigationAction[] = [];

    /**
     * Subject emitting icon changes to show in the navigation button.
     */
    private _iconChanges: Subject<string> = new Subject<string>();

    constructor(
        private readonly _zone: NgZone
    ) {
    }

    /**
     * Called on service destruction.
     */
    ngOnDestroy(): void {
        this._iconChanges.complete();
    }

    /**
     * Get notified of icon name changes.
     */
    get iconChanges(): Observable<string> {
        return this._iconChanges.asObservable();
    }

    /**
     * Push a action to navigation.
     * @param action to push
     */
    public pushAction(action: INavigationAction) {
        this._actions.push(action);

        this._iconChanges.next(action.iconName);
    }

    /**
     * Pop the last action from the navigation.
     */
    public popAction() {
        this._actions.pop();
    }

    /**
     * Run the next action.
     */
    public runNext() {
        const nextIndex = this._actions.length - this._openActions.length - 1;
        if (nextIndex < 0) {
            return;
        }

        const next = this._actions[nextIndex];
        this._openActions.push(next);

        if (nextIndex > 0) {
            this._iconChanges.next(this._actions[nextIndex - 1].iconName);
        }

        next.run().subscribe(() => {
            this._openActions.pop();
            this._iconChanges.next(next.iconName);
        });
    }

}

/**
 * A navigation action.
 */
export interface INavigationAction {

    /**
     * Name of the icon to display.
     */
    iconName: string;

    /**
     * Run the next action and return a observable of when the action
     * has been revoked.
     */
    run(): Observable<void>;

}
