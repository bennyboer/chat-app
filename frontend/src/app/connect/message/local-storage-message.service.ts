import {Injectable, OnDestroy} from '@angular/core';
import {MessageService} from './message.service';
import {Observable, Subject} from 'rxjs';
import {IMessage} from '../../model/chat/message';


/**
 * Message service using only local storage.
 */
@Injectable()
export class LocalStorageMessageService extends MessageService implements OnDestroy {

    /**
     * Subject emitting events whenever any chat message changes.
     */
    private allChangesSubject: Subject<[number, IMessage]> = new Subject<[number, IMessage]>();

    /**
     * Map of chat change subjects currently observed.
     */
    private changesSubjects: Map<number, Subject<IMessage>> = new Map<number, Subject<IMessage>>();

    /**
     * Local messages.
     */
    private messages: Map<number, IMessage[]> = new Map<number, IMessage[]>();

    constructor() {
        super();
    }

    /**
     * On service destruction.
     */
    public ngOnDestroy(): void {
        for (const subject of this.changesSubjects.values()) {
            subject.complete();
        }
    }

    public connect(): Promise<void> {
        return;
    }

    public disconnect(): Promise<void> {
        return;
    }

    public changes(chatId: number): Observable<IMessage> {
        let subject: Subject<IMessage> = this.changesSubjects.get(chatId);
        if (!subject) {
            subject = new Subject<IMessage>();
            this.changesSubjects.set(chatId, subject);
        }

        return subject.asObservable();
    }

    public allChanges(): Observable<[number, IMessage]> {
        return this.allChangesSubject.asObservable();
    }

    public async getAll(chatId: number, page: number): Promise<IMessage[]> {
        const result = this.messages.get(chatId);
        if (!result) {
            return [];
        }

        return result.slice();
    }

    public async send(chatId: number, userId: number, message: string, messageType: string): Promise<void> {
        let messageList = this.messages.get(chatId);
        if (!messageList) {
            messageList = [];
            this.messages.set(chatId, messageList);
        }

        const msg: IMessage = {
            authorId: userId,
            content: message,
            timestamp: Date.now(),
            type: messageType
        };

        messageList.push(msg);

        const subject = this.changesSubjects.get(chatId);
        if (!!subject) {
            subject.next(msg);
        }
        this.allChangesSubject.next([chatId, msg]);
    }

}
