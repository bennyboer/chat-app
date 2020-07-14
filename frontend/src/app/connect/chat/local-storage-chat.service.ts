import {Injectable} from '@angular/core';
import {ChatService} from './chat.service';
import {IChat} from '../../model/chat/chat';

/**
 * Chat service using local storage.
 */
@Injectable()
export class LocalStorageChatService extends ChatService {

    /**
     * All currently managed chats.
     */
    private _chats: IChat[] = [];

    public async getAll(userId: number): Promise<IChat[]> {
        return this._chats;
    }

    public async getForId(id: number): Promise<IChat> {
        return this._chats.find((c) => c.id === id);
    }

    public async create(userId: number, chat: IChat): Promise<number> {
        chat.id = this._chats.length + 1;
        this._chats.push(chat);

        return chat.id;
    }

    public async update(chat: IChat): Promise<boolean> {
        const index = this._chats.indexOf(await this.getForId(chat.id));
        this._chats[index] = chat;
        return true;
    }

    public async remove(id: number): Promise<boolean> {
        const index = this._chats.indexOf(await this.getForId(id));
        if (index > -1) {
            this._chats.splice(index, 1);
        }

        return true;
    }

}
