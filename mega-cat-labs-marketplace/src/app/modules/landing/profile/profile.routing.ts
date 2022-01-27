import { Route } from '@angular/router';
import { ProfileComponent } from 'app/modules/landing/profile/profile.component';

export const landingProfileRoutes: Route[] = [
    {
        path     : '',
        component: ProfileComponent
    }
];
