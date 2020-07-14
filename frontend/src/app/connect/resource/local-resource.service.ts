import {ResourceService} from './resource.service';
import {Injectable} from '@angular/core';
import {IResourceInfo} from '../../model/resource/resource-info';

/**
 * Local resource service which can be used for testing.
 */
@Injectable()
export class LocalResourceService extends ResourceService {

    public async getAll(): Promise<IResourceInfo[]> {
        return [];
    }

    public async getForUser(userId: number): Promise<IResourceInfo[]> {
        return [];
    }

    public async download(id: string): Promise<any> {
        return null;
    }

    public async remove(id: string): Promise<boolean> {
        return true;
    }

    public async upload(formData: FormData): Promise<string> {
        return 'EMPTY';
    }

}
