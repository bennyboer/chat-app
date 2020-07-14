import {Injectable} from '@angular/core';
import {IResourceInfo} from '../../model/resource/resource-info';

/**
 * Service used to upload/download resource.
 */
@Injectable()
export abstract class ResourceService {

    /**
     * Get all resource informations.
     */
    abstract async getAll(): Promise<IResourceInfo[]>;

    /**
     * Get all resource infos for the passed user.
     * @param userId of the user to get resources for
     */
    abstract async getForUser(userId: number): Promise<IResourceInfo[]>;

    /**
     * Upload a resource using the passed form data.
     * @param formData to upload
     */
    abstract async upload(formData: FormData): Promise<string>;

    /**
     * Download the resource with the passed ID.
     * @param id of the resource to download
     */
    abstract async download(id: string): Promise<any>;

    /**
     * Load an image resource as base64 encoded string
     * @param id of the image resource
     */
    public async loadImage(id: string): Promise<string | ArrayBuffer> {
        const blob: Blob = await this.download(id);

        return await this.loadImageFromBlob(blob);
    }

    /**
     * Load an image resource as base64 encoded string from BLOB.
     * @param blob to load from
     */
    public async loadImageFromBlob(blob: Blob): Promise<string | ArrayBuffer> {
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onerror = () => {
                reader.abort();
                reject(new Error('Could not parse image'));
            };

            reader.onload = () => {
                resolve(reader.result);
            };

            reader.readAsDataURL(blob);
        });
    }

    /**
     * Remove the resource with the passed ID.
     * @param id to remove resource with
     */
    abstract async remove(id: string): Promise<boolean>;

}
