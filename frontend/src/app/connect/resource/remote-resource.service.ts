import {ResourceService} from './resource.service';
import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {IResourceInfo} from '../../model/resource/resource-info';

/**
 * Resource service used to up/download resource.
 */
@Injectable()
export class RemoteResourceService extends ResourceService {

    /**
     * URL to controller.
     */
    private static readonly _URL = '/api/resource';

    /**
     * Cache of already downloaded resources.
     */
    private _cache: Map<string, Blob> = new Map<string, Blob>();

    constructor(
        private readonly _http: HttpClient
    ) {
        super();
    }

    public async getAll(): Promise<IResourceInfo[]> {
        const response: HttpResponse<IResourceInfo[]> = await this._http.get<IResourceInfo[]>(`${RemoteResourceService._URL}`, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 200) {
            return [];
        }

        return !!response.body ? response.body : [];
    }

    public async getForUser(userId: number): Promise<IResourceInfo[]> {
        const response: HttpResponse<IResourceInfo[]> = await this._http.get<IResourceInfo[]>(`${RemoteResourceService._URL}/for/${userId}`, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 200) {
            return [];
        }

        return !!response.body ? response.body : [];
    }

    public async download(id: string): Promise<Blob> {
        // Check if resource already cached.
        const cachedBlob: Blob = this._cache.get(id);
        if (!!cachedBlob) {
            return cachedBlob;
        }

        // Request resource from server.
        const response: HttpResponse<Blob> = await this._http.get(`${RemoteResourceService._URL}/${id}`, {
            observe: 'response',
            responseType: 'blob'
        }).toPromise();

        if (response.status !== 200) {
            return null;
        }

        const blob = response.body;
        this._cache.set(id, blob); // Cache resolved resource
        return blob;
    }

    public async remove(id: string): Promise<boolean> {
        const response: HttpResponse<any> = await this._http.delete<any>(`${RemoteResourceService._URL}/${id}`, {
            observe: 'response'
        }).toPromise();

        return response.status === 200;
    }

    public async upload(formData: FormData): Promise<string> {
        const response: HttpResponse<string> = await this._http.post<any>(`${RemoteResourceService._URL}/upload`, formData, {
            observe: 'response'
        }).toPromise();

        if (response.status !== 201) {
            return null;
        }

        const location = response.headers.get('location');

        const parts = location.split('/');
        return parts[parts.length - 1].trim();
    }

}
