import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from './view/login/login.component';
import {ChatComponent} from './view/chat/chat.component';
import {ProfileComponent} from './view/profile/profile.component';
import {AuthGuardService} from './router/guard/auth-guard.service';
import {AdminComponent} from './view/admin/admin.component';
import {UserManagementComponent} from './view/admin/user/user-management.component';
import {DefaultManagementComponent} from './view/admin/default/default-management.component';
import {CreateUserComponent} from './view/admin/create/create-user.component';
import {EditUserComponent} from './view/admin/edit/edit-user.component';
import {SignupComponent} from './view/signup/signup.component';
import {ErrorComponent} from './view/error/error.component';
import {ResourceManagementComponent} from './view/admin/resource/resource-management.component';

const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: SignupComponent},
    {path: 'chat', component: ChatComponent, canActivate: [AuthGuardService], data: {roles: ['ROLE_USER']}},
    {path: 'chat/:id', component: ChatComponent, canActivate: [AuthGuardService], data: {roles: ['ROLE_USER']}},
    {path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService], data: {roles: ['ROLE_USER', 'ROLE_ADMIN']}},
    {
        path: 'admin', component: AdminComponent, canActivate: [AuthGuardService], data: {roles: ['ROLE_ADMIN']}, children: [
            {path: '', component: DefaultManagementComponent},
            {path: 'user', component: UserManagementComponent},
            {path: 'user/create', component: CreateUserComponent},
            {path: 'user/:id', component: EditUserComponent},
            {path: 'resource', component: ResourceManagementComponent}
        ]
    },
    {path: 'error', component: ErrorComponent},
    {path: 'error/:code', component: ErrorComponent},
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {path: '**', redirectTo: '/error/403'}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
