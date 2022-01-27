import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { NftCardModule } from 'app/modules/elements/nft-card/nft-card.module';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { FuseHighlightModule } from '@fuse/components/highlight';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProfileComponent } from 'app/modules/admin/profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { CreateComponent } from './create/create.component';
import { CreateCollectionComponent } from './create-collection/create-collection.component';

import { WalletGuard } from '../../../core/auth/guards/wallet.guard';

import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { WalletComponent } from './wallet/wallet.component';
import { Role } from 'app/core/models/role';
import { AchievementComponent } from './achievement/achievement.component';

const routes: Route[] = [
  {
    path: '',
    component: ProfileComponent
  },
  {
    path: 'wallet',
    component: WalletComponent
  },
  {
    path: 'settings',
    canActivate: [WalletGuard],
    component: SettingsComponent
  },
  {
    path: 'achievement',
    component: AchievementComponent
  },
  {
    path: 'create',
    data: {
      roles: [Role.Admin]
    },
    canActivate: [AuthGuard, WalletGuard],
    component: CreateComponent
  },
  {
    path: 'create-collection',
    data: {
      roles: [Role.Admin]
    },
    canActivate: [AuthGuard, WalletGuard],
    component: CreateCollectionComponent
  }


];

@NgModule({
  declarations: [
    ProfileComponent,
    SettingsComponent,
    CreateComponent,
    WalletComponent,
    AchievementComponent,
    CreateCollectionComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    HttpClientModule,
    NftCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatMomentDateModule,
    MatSelectModule,
    FuseHighlightModule,
    MatListModule,
    MatProgressSpinnerModule,
    RouterModule.forChild(routes)
  ]
})

export class ProfileModule { }

