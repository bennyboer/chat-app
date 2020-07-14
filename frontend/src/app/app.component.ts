import {AfterViewInit, ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ThemeService} from './theme/theme.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {MatDrawer} from '@angular/material/sidenav';
import {NavigationButtonService} from './view/mobile/navigation-button/service/navigation-button.service';
import {MessageService} from './connect/message/message.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {IMessage} from './model/chat/message';
import {AuthService} from './connect/auth/auth.service';
import {IUser} from './model/user/user';

/**
 * Entry component of the application.
 */
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

    /**
     * Whether dark mode is enabled.
     */
    public isDarkMode = false;

    /**
     * Subscription to changes of the theme.
     */
    private _themeChangesSub: Subscription;

    /**
     * Side navigation drawer reference.
     */
    @ViewChild(MatDrawer)
    public drawer: MatDrawer;

    /**
     * Current screen width.
     */
    public screenWidth: number = window.innerWidth;

    /**
     * Subscription to router events.
     */
    private _routerEventsSub: Subscription;

    /**
     * Subscription to message changes.
     */
    private _msgChangeSub: Subscription;

    /**
     * Subscription to authentication events.
     */
    private _authSub: Subscription;

    /**
     * Currently authenticated user.
     */
    private _authUser: IUser | null = null;

    constructor(
        private readonly _router: Router,
        private readonly _snackBar: MatSnackBar,
        private readonly _renderer: Renderer2,
        private readonly _themeService: ThemeService,
        private readonly _navigationButtonService: NavigationButtonService,
        private readonly _msgService: MessageService,
        private readonly _authService: AuthService
    ) {
    }

    /**
     * Called on theme change.
     * @param darkMode whether dark mode is enabled.
     */
    private _onThemeChange(darkMode: boolean) {
        if (darkMode) {
            this._renderer.addClass(document.body, 'theme-alternate');
        } else {
            this._renderer.removeClass(document.body, 'theme-alternate');
        }
    }

    /**
     * Called on component initialization.
     */
    ngOnInit(): void {
        this.isDarkMode = this._themeService.darkMode;
        this._onThemeChange(this.isDarkMode);
        this._themeChangesSub = this._themeService.changes.subscribe((darkMode) => {
            this.isDarkMode = darkMode;
            this._onThemeChange(this.isDarkMode);
        });

        this._authUser = this._authService.getAuthenticatedUser();
        this._authSub = this._authService.authChanges().subscribe((authUser) => {
            this._authUser = authUser;
            if (!!authUser) {
                this._msgService.disconnect();
                this._msgService.connect();
            } else {
                this._msgService.disconnect();
            }
        });

        this._msgChangeSub = this._msgService.allChanges().subscribe((event) => {
            const chatId = event[0];
            const msg = event[1];

            // Check whether chat is already shown
            const url = this._router.url;
            const isAlreadyShown = url.endsWith(`chat/${chatId}`);

            if (!!this._authUser && !isAlreadyShown && msg.authorId !== this._authUser.id) {
                this._showNewMessageNotification(chatId, msg);
            }
        });
    }

    /**
     * Show notification for new messages.
     * @param chatId of the chat the message belongs to
     * @param msg new message
     */
    private _showNewMessageNotification(chatId: number, msg: IMessage) {
        // Cut messages that are too long.
        let content = msg.content;
        if (content.length > 100) {
            content = `${content.substring(0, 100)} [...]`;
        }

        let notification = `New chat message: "${content}"`;
        if (msg.type === 'IMAGE') {
            notification = 'An image message has been received!';
        }

        const snackBarRef = this._snackBar.open(notification, 'To chat', {
            verticalPosition: 'bottom',
            duration: 5000
        });
        snackBarRef.onAction().subscribe(() => {
            this._router.navigate(['/chat', chatId]);
        });
    }

    /**
     * Called after the view has been initialized.
     */
    ngAfterViewInit(): void {
        this._navigationButtonService.pushAction({
            iconName: 'menu',
            run: () => {
                this.drawer.open();
                return this.drawer.closedStart;
            }
        });

        this._routerEventsSub = this._router.events.subscribe(() => {
            if (!this.drawer.disableClose) {
                this.drawer.close();
            }
        });
    }

    /**
     * Called when the component is destroyed.
     */
    ngOnDestroy(): void {
        this._navigationButtonService.popAction();
        this._routerEventsSub.unsubscribe();
        this._themeChangesSub.unsubscribe();
        this._msgChangeSub.unsubscribe();
    }

    /**
     * Called when the window resizes.
     */
    @HostListener('window:resize')
    public onWindowResize() {
        this.screenWidth = window.innerWidth;
    }

    /**
     * Whether a user is currently logged in.
     */
    public isLoggedIn(): boolean {
        return !!this._authUser;
    }

}
