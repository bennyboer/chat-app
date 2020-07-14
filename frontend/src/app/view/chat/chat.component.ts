import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, ViewChild} from '@angular/core';
import {MatDrawer} from '@angular/material/sidenav';
import {NavigationButtonService} from '../mobile/navigation-button/service/navigation-button.service';
import {ActivatedRoute} from '@angular/router';
import {ChatComponentService} from './service/chat-component.service';
import {ChatListService} from './list/service/chat-list.service';

/**
 * Component displaying the chat (chat list, message timeline and input field).
 */
@Component({
    selector: 'app-chat-component',
    templateUrl: 'chat.component.html',
    styleUrls: ['chat.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ChatComponentService, ChatListService]
})
export class ChatComponent implements AfterViewInit, OnDestroy {

    /**
     * Chat list drawer reference.
     */
    @ViewChild(MatDrawer)
    public drawer: MatDrawer;

    /**
     * Current screen width.
     */
    public screenWidth: number = window.innerWidth;

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _route: ActivatedRoute,
        private readonly _navigationButtonService: NavigationButtonService
    ) {
    }

    /**
     * Called after the components view initialized.
     */
    ngAfterViewInit(): void {
        this._navigationButtonService.pushAction({
            iconName: 'arrow_back_ios',
            run: () => {
                this.drawer.open();
                this._cd.markForCheck();
                return this.drawer.closedStart;
            }
        });
    }

    /**
     * Called on component destruction.
     */
    ngOnDestroy(): void {
        this._navigationButtonService.popAction();
    }

    /**
     * Called when the window resizes.
     */
    @HostListener('window:resize')
    public onWindowResize() {
        this.screenWidth = window.innerWidth;
    }

}
