import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorsService } from 'app/core/errors/errors.service';
import { WalletService } from 'app/core/wallet/wallet.service';

import { WalletComponent } from './wallet.component';

describe('WalletComponent', () => {
  let component: WalletComponent;
  let fixture: ComponentFixture<WalletComponent>;
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['isWalletActive', 'connectToMetaMask']);
  const errorServiceMock = jasmine.createSpyObj('ErrorService', ['openSnackBar']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletComponent ],
      providers: [
        { provide: WalletService, useValue: walletServiceMock },
        { provide: ErrorsService, useValue: errorServiceMock }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
