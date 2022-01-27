import {APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExtraOptions, PreloadAllModules, RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { FuseModule } from '@fuse';
import { FuseConfigModule } from '@fuse/services/config';
import { FuseMockApiModule } from '@fuse/lib/mock-api';
import { CoreModule } from 'app/core/core.module';
import { appConfig } from 'app/core/config/app.config';
import { mockApiServices } from 'app/mock-api';
import { LayoutModule } from 'app/layout/layout.module';
import { AppComponent } from 'app/app.component';
import { appRoutes, AppRoutingModule } from 'app/app-routing.module';
import {
    SocialLoginModule,
    SocialAuthServiceConfig,
} from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HeaderInterceptor } from './http-header.interceptor';
import { LandingLayoutModule } from './modules/layout/landing-layout/landing-layout.module';
import { MatTabsModule } from '@angular/material/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AvatarPopupComponent } from './modules/elements/avatar-popup/avatar-popup.component';
import { EmailPopupComponent } from './modules/elements/email-popup/email-popup.component';
import { PasswordPopupComponent } from './modules/elements/password-popup/password-popup.component';
import { environment } from 'environments/environment';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { provideAnalytics,getAnalytics,ScreenTrackingService,UserTrackingService } from '@angular/fire/analytics';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideFunctions,getFunctions } from '@angular/fire/functions';
import { provideMessaging,getMessaging } from '@angular/fire/messaging';
import { providePerformance,getPerformance } from '@angular/fire/performance';
import { provideRemoteConfig,getRemoteConfig } from '@angular/fire/remote-config';
import { provideStorage,getStorage } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { PaymentDetailsPopupComponent } from './modules/elements/payment-details-popup/payment-details-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CollectionCreatedPopupComponent } from './modules/elements/collection-created-popup/collection-created-popup.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { NftCreatedPopupComponent } from './modules/elements/nft-created-popup/nft-created-popup.component';

const routerConfig: ExtraOptions = {
    preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled',
};

@NgModule({
  declarations: [
    AppComponent,
    AvatarPopupComponent,
    EmailPopupComponent,
    PasswordPopupComponent,
    PaymentDetailsPopupComponent,
    CollectionCreatedPopupComponent,
    NftCreatedPopupComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    MatTabsModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule, // RouterModule.forRoot(appRoutes),
    // Fuse, FuseConfig & FuseMockAPI
    FuseModule,
    FuseConfigModule.forRoot(appConfig),
    FuseMockApiModule.forRoot(mockApiServices),

    // Core module of your application
    CoreModule,

    // Layout module of your application
    LayoutModule,

    // Landing pages layout
    LandingLayoutModule,

    // 3rd party modules that require global configuration via forRoot
    MarkdownModule.forRoot({}),
    // SSO module
    SocialLoginModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    ModalModule.forRoot(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
    providePerformance(() => getPerformance()),
    provideRemoteConfig(() => getRemoteConfig()),
    provideStorage(() => getStorage()),
    NgbModule,
    MatButtonModule
  ],
  providers: [
      {
          provide: 'SocialAuthServiceConfig',
          useValue: {
              autoLogin: false,
              providers: [
                  {
                      id: GoogleLoginProvider.PROVIDER_ID,
                      provider: new GoogleLoginProvider(
                          '1044724572945-9gaa7d3843fg86a3jv8pnhorec8gdb4j.apps.googleusercontent.com'
                      ),
                  },
              ],
          } as SocialAuthServiceConfig,
      },
      {
          provide: HTTP_INTERCEPTORS,
          useClass: HeaderInterceptor,
          multi: true,
      },
      ScreenTrackingService,UserTrackingService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
