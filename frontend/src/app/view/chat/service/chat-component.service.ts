import {Injectable, OnDestroy} from '@angular/core';
import {Subject, Observable} from 'rxjs';

/**
 * Service used to communicate between chat component sub-components.
 */
@Injectable()
export class ChatComponentService implements OnDestroy {

    /**
     * Subject emitting events when the chats changed.
     */
    private readonly _chatsChangedSub: Subject<void> = new Subject<void>();

    /**
     * Called on service destruction.
     */
    public ngOnDestroy(): void {
        this._chatsChangedSub.complete();
    }

    /**
     * Notify listeners that the chats have been changed.
     */
    public notifyChatsChanged(): void {
        this._chatsChangedSub.next();
    }

    /**
     * Get an observable getting notified when the chats change.
     */
    public getChatsChangedObservable(): Observable<void> {
        return this._chatsChangedSub.asObservable();
    }

}
