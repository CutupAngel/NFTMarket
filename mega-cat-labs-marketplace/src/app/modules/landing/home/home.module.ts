import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { landingHomeRoutes } from 'app/modules/landing/home/home.routing';
import { CardModule } from 'app/modules/elements/card/card.module';
import { CardComponent } from 'app/modules/elements/card/card.component';
import {IvyCarouselModule} from 'angular-responsive-carousel';

@NgModule({
    declarations: [
        LandingHomeComponent,
        CardComponent
    ],
    imports     : [
        RouterModule.forChild(landingHomeRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        CardModule,
        IvyCarouselModule
    ]
})
export class LandingHomeModule
{
}
