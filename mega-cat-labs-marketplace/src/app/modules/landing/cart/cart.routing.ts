import { Route } from '@angular/router';
import { CartComponent } from 'app/modules/landing/cart/cart.component';

export const landingCartRoutes: Route[] = [
    {
        path     : '',
        component: CartComponent
    }
];
