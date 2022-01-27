import { TestBed } from '@angular/core/testing';

import { WalletGuard } from './wallet.guard';
import {WalletService} from '../../wallet/wallet.service';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import { of } from 'rxjs';

describe('WalletGuard', () => {
  let guard: WalletGuard;
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['isWalletActive']);
  walletServiceMock.isWalletActive.and.returnValue(true);
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  routerMock.navigate.and.returnValue(of(false));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: WalletService, useValue: walletServiceMock },
        { provide: Router, useValue: routerMock },
      ]});
    guard = TestBed.inject(WalletGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
