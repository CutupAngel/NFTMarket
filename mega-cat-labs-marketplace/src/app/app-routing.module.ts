import {Route, RouterModule} from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';
import { LandingLayoutComponent } from './modules/layout/landing-layout/landing-layout.component';
import {NgModule} from '@angular/core';
import { Role } from './core/models/role';
import {WalletGuard} from './core/auth/guards/wallet.guard';

const defaultRedirectLandingPage: string = '/market';
// @formatter:off
// tslint:disable:max-line-length
export const appRoutes: Route[] = [

    /* Standard routes
     * Routes that are to be accessible regardless of whether a user is logged in or not.
     */
    {
        path: '',
        component  : LandingLayoutComponent,
        children   : [
            {path: '', pathMatch: 'full', redirectTo: defaultRedirectLandingPage},
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)},
            {path: 'market', loadChildren: () => import('app/modules/landing/collections/collections.module').then(m => m.CollectionsModule)},
            {path: 'market/sale/:id', loadChildren: () => import('app/modules/landing/collection-details/collection-details.module').then(m => m.CollectionDetailsModule)},
            {path: 'cart', loadChildren: () => import('app/modules/landing/cart/cart.module').then(m => m.CartModule)},
            {path: 'old/profile', canActivate: [WalletGuard], loadChildren: () => import('app/modules/landing/profile/profile.module').then(m => m.ProfileModule)},
            {path: 'order-success', loadChildren: () => import('app/modules/landing/order-success/order-success.module').then(m => m.OrderSuccessModule)},
        ]
    },

    /* Helper routes
     * After user signs in, they are redirected to this route, which then redirects them to the desired location.
     * Path is here for convenience and collocation/centralization of all routes in this module.
     */
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'market'},
    {path: 'default', pathMatch: 'full', redirectTo: defaultRedirectLandingPage},
    {path: 'connect-wallet', pathMatch: 'full', redirectTo: 'profile/wallet'},
    {path: 'chain-id-change', pathMatch: 'full', redirectTo: 'home'},

    /* GUEST routes
     * Routes that are only for unathenticated users; these are primarily to help users sign-in, sign-up, etc..
     * these routes should not be accessible for users that are already signed in.
     */
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            entry: 'guests, no-auth-guard',
            layout: 'empty'
        },
        children: [
            {
                path: 'confirmation-required',
                loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module')
                    .then(m => m.AuthConfirmationRequiredModule)},
            {
                path: 'forgot-password',
                loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module')
                    .then(m => m.AuthForgotPasswordModule)},
            {
                path: 'reset-password',
                loadChildren: () => import('app/modules/auth/reset-password/reset-password.module')
                    .then(m => m.AuthResetPasswordModule)},
            {
                path: 'sign-in',
                loadChildren: () => import('app/modules/auth/sign-in/sign-in.module')
                    .then(m => m.AuthSignInModule)},
            {
                path: 'sign-up',
                loadChildren: () => import('app/modules/auth/sign-up/sign-up.module')
                    .then(m => m.AuthSignUpModule)
            }
        ]
    },

    /* AUTHENTICATED routes
     * Routes that require a user to be authenticated. These routes should not be accessible for guests (unauthenticated users).
     */
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty',
            roles: [Role.User, Role.Admin, Role.SuperUser]
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule)},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule)}
        ]
    },

    /* ADMNINISTRATOR routes
     * Routes purely for administrators only. These are for authenticated users that have special roles. Standard users
     * of the system should not have access to these routes.
     * TODO: Restrict these routes based on roles.
     */
    {
        path       : '',
        canActivate: [WalletGuard, AuthGuard],
        canActivateChild: [WalletGuard, AuthGuard],
        component  : LayoutComponent,
        resolve    : {
            initialData: InitialDataResolver,
        },
        data: {
            layout: 'classy', // Keep set to classy or we lose our UI.
            //roles: [Role.Admin, Role.SuperUser]
        },
        children   : [
            {path: 'dashboard', loadChildren: () => import('app/modules/admin/dashboard/dashboard.module').then(m => m.DashboardModule)},
            {path: 'create-product', loadChildren: () => import('app/modules/admin/product/create-product/create-product.module').then(m => m.CreateProductModule)},
            {path: 'list-product', loadChildren: () => import('app/modules/admin/product/list-product/list-product.module').then(m => m.ListProductModule)},
            {path: 'edit-product/:id', loadChildren: () => import('app/modules/admin/product/edit-product/edit-product.module').then(m => m.EditProductModule)},
        ]
    },

    /* Profile routes
     * Routes for profile features that require a user to be authenticated.
     * These routes should not be accessible for guests (unauthenticated users).
     */
    {
        path: 'profile',
        canActivate: [],
        canActivateChild: [],
        component: LandingLayoutComponent,
        children   : [
            {path: '', loadChildren: () => import('app/modules/admin/profile/profile.module').then(m => m.ProfileModule)},
        ]
    },

    // otherwise, redirect to default
    { path: '**', redirectTo: defaultRedirectLandingPage }];

@NgModule({
    imports: [
        // RouterModule.forRoot(appRoutes, {useHash: true})
        RouterModule.forRoot(appRoutes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {

}
