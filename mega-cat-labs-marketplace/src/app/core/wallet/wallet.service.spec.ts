import { TestBed } from '@angular/core/testing';
import { WalletService } from './wallet.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NgZone } from '@angular/core';

describe('WalletService', () => {
  let service: WalletService;
  const ngZoneMock = jasmine.createSpyObj('NgZone', ['run']);
  ngZoneMock.run.and.returnValue(of(false));
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  routerMock.navigate.and.returnValue(of(false));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
      ]
    });
    service = TestBed.inject(WalletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
