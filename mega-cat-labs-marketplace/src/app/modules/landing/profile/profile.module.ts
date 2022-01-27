import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { landingProfileRoutes } from './profile.routing';
import { ProfileComponent } from './profile.component';
import { SharedModule } from 'app/shared/shared.module';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
    declarations: [ProfileComponent],
    imports: [
        CommonModule,
        MatTabsModule,
        RouterModule.forChild(landingProfileRoutes),
        SharedModule,
    ],
})
export class ProfileModule {}
