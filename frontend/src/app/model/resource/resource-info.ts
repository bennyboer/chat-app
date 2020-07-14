/**
 * Representation of a resource information.
 */
import {IUser} from '../user/user';

export interface IResourceInfo {

    /**
     * ID of the resource.
     */
    resourceId: string;

    /**
     * ID of the owner.
     */
    ownerId: number;

    /**
     * Whether the resource is publicly available.
     */
    public: boolean;

    /**
     * Original name of the file which has been uploaded.
     */
    originalName: string;

    /**
     * Size of the resource.
     */
    size: number;

    /**
     * Content type of the resource.
     */
    contentType: string;

    /**
     * Timestamp of when the resource has been created.
     */
    timestamp: number;

}
