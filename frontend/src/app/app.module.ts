import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ThemeService} from './theme/theme.service';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatButtonModule} from '@angular/material/button';
import {ProfileComponent} from './view/profile/profile.component';
import {LoginComponent} from './view/login/login.component';
import {MenuComponent} from './view/menu/menu.component';
import {ChatComponent} from './view/chat/chat.component';
import {TimelineComponent} from './view/chat/timeline/timeline.component';
import {MessageComponent} from './view/chat/timeline/message/message.component';
import {InputComponent} from './view/chat/input/input.component';
import {ListComponent} from './view/chat/list/list.component';
import {GroupItemComponent} from './view/chat/list/item/group/group-item.component';
import {PrivateItemComponent} from './view/chat/list/item/private/private-item.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatMenuModule} from '@angular/material/menu';
import {MatListModule} from '@angular/material/list';
import {ChatService} from './connect/chat/chat.service';
import {MatIconModule} from '@angular/material/icon';
import {AvatarModule} from 'ngx-avatar';
import {HttpClientModule} from '@angular/common/http';
import {NavigationComponent} from './view/menu/navigation/navigation.component';
import {NavigationButtonComponent} from './view/mobile/navigation-button/navigation-button.component';
import {NavigationButtonService} from './view/mobile/navigation-button/service/navigation-button.service';
import {LocalStorageChatService} from './connect/chat/local-storage-chat.service';
import {MessageService} from './connect/message/message.service';
import {LocalStorageMessageService} from './connect/message/local-storage-message.service';
import {UserService} from './connect/user/user.service';
import {AuthService} from './connect/auth/auth.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatToolbarModule} from '@angular/material/toolbar';
import {LocalSettingsService} from './connect/settings/local-settings.service';
import {VirtualScrollerModule} from 'ngx-virtual-scroller';
import {MatDialogModule} from '@angular/material/dialog';
import {CreateChatDialogComponent} from './view/chat/list/dialog/create/create-chat-dialog.component';
import {UserSelectComponent} from './view/misc/user/select/user-select.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {SimplebarAngularModule} from 'simplebar-angular';
import {AuthGuardService} from './router/guard/auth-guard.service';
import {AdminComponent} from './view/admin/admin.component';
import {AuthGuardDirective} from './router/guard/auth-guard.directive';
import {UserManagementComponent} from './view/admin/user/user-management.component';
import {DefaultManagementComponent} from './view/admin/default/default-management.component';
import {CreateUserComponent} from './view/admin/create/create-user.component';
import {MatSelectModule} from '@angular/material/select';
import {RoleService} from './connect/auth/role/role.service';
import {EditUserComponent} from './view/admin/edit/edit-user.component';
import {SignupComponent} from './view/signup/signup.component';
import {PasswordValidatorDirective} from './view/signup/validator/password-validator.directive';
import {ErrorComponent} from './view/error/error.component';
import {JwtModule} from '@auth0/angular-jwt';
import {RemoteAuthService} from './connect/auth/remote-auth.service';
import {RemoteUserService} from './connect/user/remote-user.service';
import {RemoteRoleService} from './connect/auth/role/remote-role.service';
import {RemoteMessageService} from './connect/message/remote-message.service';
import {ConfirmDialogComponent} from './view/misc/dialog/confirm/confirm-dialog.component';
import {RemoteChatService} from './connect/chat/remote-chat.service';
import {ResourceService} from './connect/resource/resource.service';
import {RemoteResourceService} from './connect/resource/remote-resource.service';
import {UserDetailsService} from './connect/user/details/user-details.service';
import {RemoteUserDetailsService} from './connect/user/details/remote-user-details.service';
import {AvatarUploadDialogComponent} from './view/profile/avatar-upload-dialog/avatar-upload-dialog.component';
import {ResourceManagementComponent} from './view/admin/resource/resource-management.component';
import {MatTableModule} from '@angular/material/table';
import {UserResourcesComponent} from './view/profile/user-resources/user-resources.component';
import {ImageDialogComponent} from './view/misc/dialog/image/image-dialog.component';
import {UserResourcesDialogComponent} from './view/profile/user-resources/dialog/user-resources-dialog.component';
import {ChatInfoDialogComponent} from './view/chat/dialog/chat-info-dialog/chat-info-dialog.component';

const MATERIAL_MODULES = [
    MatSlideToggleModule,
    MatButtonModule,
    MatSidenavModule,
    MatMenuModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatDialogModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatSelectModule,
    MatTableModule
];

@NgModule({
    declarations: [
        AppComponent,
        MenuComponent,
        NavigationComponent,
        ProfileComponent,
        LoginComponent,
        ChatComponent,
        TimelineComponent,
        MessageComponent,
        InputComponent,
        ListComponent,
        GroupItemComponent,
        PrivateItemComponent,
        NavigationButtonComponent,
        CreateChatDialogComponent,
        UserSelectComponent,
        AdminComponent,
        AuthGuardDirective,
        UserManagementComponent,
        DefaultManagementComponent,
        CreateUserComponent,
        EditUserComponent,
        SignupComponent,
        PasswordValidatorDirective,
        ErrorComponent,
        ConfirmDialogComponent,
        AvatarUploadDialogComponent,
        ResourceManagementComponent,
        UserResourcesComponent,
        ImageDialogComponent,
        UserResourcesDialogComponent,
        ChatInfoDialogComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        JwtModule.forRoot({
            config: {
                tokenGetter: RemoteAuthService.getToken
            }
        }),
        ...MATERIAL_MODULES,
        AvatarModule,
        FormsModule,
        VirtualScrollerModule,
        SimplebarAngularModule
    ],
    providers: [
        ThemeService,
        LocalSettingsService,
        {provide: UserService, useClass: RemoteUserService},
        {provide: AuthService, useClass: RemoteAuthService},
        {provide: RoleService, useClass: RemoteRoleService},
        {provide: ChatService, useClass: RemoteChatService},
        {provide: MessageService, useClass: RemoteMessageService},
        {provide: ResourceService, useClass: RemoteResourceService},
        {provide: UserDetailsService, useClass: RemoteUserDetailsService},
        NavigationButtonService,
        AuthGuardService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
