import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { from, of } from 'rxjs';
import { WalletService } from '../../../core/wallet/wallet.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    const mockedEthereum = {
      on: jasmine.createSpy('on', (event, callback) => {
          if(event === 'accountsChanged') {
              callback(['0xd954F4513BdE1E00F3986630A7e73c4f9aA564fE']);
          }
      })
    };
    const walletServiceMock = jasmine.createSpyObj('WalletService', ['getAccounts', 'isMetaMaskInstalled']);
    walletServiceMock.getAccounts.and.returnValue(from([]));
    walletServiceMock.isMetaMaskInstalled.and.returnValue(true);

    const authServiceMock = jasmine.createSpyObj('AuthService', ['check','isAdmin']);
    authServiceMock.check.and.returnValue(of(false));
    authServiceMock.isAdmin.and.returnValue(of(false));
    await TestBed.configureTestingModule({
        declarations: [ HeaderComponent ],
        providers: [
          { provide: HttpHandler },
          { provide: HttpClient },
          { provide: WalletService, useValue: walletServiceMock },
          { provide: AuthService, useValue: authServiceMock },
          { provide: CartService }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
