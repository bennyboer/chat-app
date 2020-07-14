import {Injectable} from '@angular/core';
import {ChatService} from './chat.service';
import {IChat} from '../../model/chat/chat';
import {HttpClient, HttpResponse} from '@angular/common/http';

/**
 * Service dealing with chat messages.
 */
@Injectable()
export class RemoteChatService extends ChatService {

    /**
     * URL to user controller.
     */
    private static readonly _URL = '/api/chats';

    constructor(
        private readonly _http: HttpClient
    ) {
        super();
    }

    public async getAll(userId: number): Promise<IChat[]> {
        const response: HttpResponse<IChat[]> = await this._http.get<IChat[]>(`${RemoteChatService._URL}/for/${userId}`, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 200) {
            return [];
        }

        return !!response.body ? response.body : [];
    }

    public async getForId(id: number): Promise<IChat> {
        const response: HttpResponse<IChat> = await this._http.get<IChat>(`${RemoteChatService._URL}/${id}`, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 200) {
            return null;
        }

        return response.body;
    }

    public async create(userId: number, chat: IChat): Promise<number> {
        const response: HttpResponse<any> = await this._http.post<any>(`${RemoteChatService._URL}`, chat, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 201) {
            return null;
        }

        // Get ID of new chat.
        const location = response.headers.get('Location');
        if (!location) {
            return null;
        }

        const locationParts = location.split('/');
        const newIdStr = locationParts[locationParts.length - 1];
        const newId: number = +newIdStr;
        if (isNaN(newId)) {
            return null;
        }

        return newId;
    }

    public async update(chat: IChat): Promise<boolean> {
        const response: HttpResponse<any> = await this._http.put<any>(`${RemoteChatService._URL}/${chat.id}`, chat, {
            observe: 'response'
        }).toPromise();

        return response.status === 204;
    }

    public async remove(id: number): Promise<boolean> {
        const response: HttpResponse<any> = await this._http.delete<any>(`${RemoteChatService._URL}/${id}`, {
            observe: 'response'
        }).toPromise();

        return response.status === 200;
    }

}
