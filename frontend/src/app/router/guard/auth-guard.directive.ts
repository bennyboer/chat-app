import {ChangeDetectorRef, Directive, EmbeddedViewRef, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {AuthService} from '../../connect/auth/auth.service';
import {Subject, Subscription} from 'rxjs';

/**
 * Directive only showing content when the user has the correct role.
 */
@Directive({
    selector: '[appHasRole]',
})
export class AuthGuardDirective implements OnInit, OnDestroy {

    /**
     * Required role.
     */
    @Input('appHasRole')
    public requiredRole: string;

    /**
     * Whether the content is already rendered.
     */
    private _isRendered = false;

    /**
     * Subscription to authenticated user changes.
     */
    private _authChangeSub: Subscription;

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _authService: AuthService,
        private readonly _viewContainerRef: ViewContainerRef,
        private readonly _templateRef: TemplateRef<any>
    ) {
    }

    /**
     * Called on directive initialization.
     */
    ngOnInit() {
        this._apply(this._authService.hasRight([this.requiredRole]));
        this._authChangeSub = this._authService.authChanges().subscribe(() => {
            this._apply(this._authService.hasRight([this.requiredRole]));
            this._cd.markForCheck();
        });
    }

    /**
     * Apply whether to show the content.
     * @param show whether to show the content
     */
    private _apply(show: boolean): void {
        if (show) {
            if (!this._isRendered) {
                this._isRendered = true;
                this._viewContainerRef.createEmbeddedView(this._templateRef);
            }
        } else {
            if (this._isRendered) {
                this._isRendered = false;
                this._viewContainerRef.clear();
            }
        }
    }

    /**
     * Called on directive destruction.
     */
    ngOnDestroy() {
        this._authChangeSub.unsubscribe();
    }

}
