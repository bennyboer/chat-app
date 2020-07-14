import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

/**
 * Error page of the application.
 */
@Component({
    selector: 'app-error-component',
    templateUrl: 'error.component.html',
    styleUrls: ['error.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorComponent implements OnInit, OnDestroy {

    /**
     * Subscription to route parameter changes.
     */
    private _paramSub: Subscription;

    /**
     * The status code to show.
     */
    public code: number | null = null;

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _route: ActivatedRoute
    ) {
    }

    /**
     * Called on component initialization.
     */
    ngOnInit(): void {
        this._paramSub = this._route.paramMap.subscribe(async (params) => {
            const codeStr: string = params.get('code');
            if (!!codeStr) {
                this.code = parseInt(codeStr, 10);
            } else {
                this.code = null;
            }
        });
    }

    /**
     * Called on component destruction.
     */
    ngOnDestroy(): void {
        this._paramSub.unsubscribe();
    }

}
