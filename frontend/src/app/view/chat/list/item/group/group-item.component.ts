import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {IChat} from '../../../../../model/chat/chat';

/**
 * Component displaying a chat list item for a group chat.
 */
@Component({
    selector: 'app-group-item-component',
    templateUrl: 'group-item.component.html',
    styleUrls: ['group-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupItemComponent {

    /**
     * Chat to display item for.
     */
    @Input()
    public chat: IChat;

}
