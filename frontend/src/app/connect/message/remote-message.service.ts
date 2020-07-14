import {Injectable} from '@angular/core';
import {MessageService} from './message.service';
import {Observable, Subject} from 'rxjs';
import {IMessage} from '../../model/chat/message';
import * as Stomp from 'stompjs';
import {RemoteAuthService} from '../auth/remote-auth.service';
import {HttpClient, HttpResponse} from '@angular/common/http';

/**
 * Message service communicating with a remote endpoint.
 */
@Injectable()
export class RemoteMessageService extends MessageService {

    constructor(
        private readonly _http: HttpClient
    ) {
        super();
    }

    /**
     * URL to user controller.
     */
    private static readonly _URL = '/api/chats/';

    /**
     * WebSocket instance used for all messaging traffic.
     *
     * /websocket postfix is required because of this:
     * https://stackoverflow.com/questions/51845452/websocket-handshake-unexpected-response-code-200-angularjs-and-spring-boot
     */
    private client: any;

    /**
     * Subject emitting events whenever any chat message changes.
     */
    private allChangesSubject: Subject<[number, IMessage]> = new Subject<[number, IMessage]>();

    /**
     * Map of chat change subjects currently observed.
     */
    private changesSubjects: Map<number, Subject<IMessage>> = new Map<number, Subject<IMessage>>();

    public async connect(): Promise<void> {
        const authtoken = RemoteAuthService.getToken();

        if (!!authtoken && authtoken.length > 0) {
            const host: string = window.location.host;
            const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:';

            const uri = `${protocol}//${host}/socket-registry/websocket`;

            this.client = Stomp.over(new WebSocket(uri));
            this.client.debug = () => {
                // Preventing debug messages from being sent to the console.
            };

            this.client.connect({Authorization: authtoken}, (frame) => {
                const username: string = frame.headers['user-name'];

                this.client.subscribe('/user/queue/specific-user', (message) => {
                    // Parse incoming JSON messages and notify any listeners.
                    const msg: IMessage = JSON.parse(message.body);

                    const subject = this.changesSubjects.get(msg.chatId);
                    if (!!subject) {
                        subject.next(msg);
                    }
                    this.allChangesSubject.next([msg.chatId, msg]);
                });
            });
        } else {
            throw new Error('No Authentication token, cannot connect to WebSocket.');
        }
    }

    public async disconnect(): Promise<void> {
        if (!!this.client) {
            this.client.disconnect();
        }
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
        const response: HttpResponse<IMessage[]> = await this._http.get<IMessage[]>(`${RemoteMessageService._URL}${chatId}/messages?page=${page}`, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 200) {
            return [];
        }

        return !!response.body ? response.body : [];
    }

    public async send(chatId: number, userId: number, message: string, messageType: string): Promise<void> {
        const messageData: IMessage = {
            chatId,
            authorId: userId,
            content: message,
            type: messageType,
        };

        this.client.send('/message/sink', {}, JSON.stringify(messageData));
    }

}
