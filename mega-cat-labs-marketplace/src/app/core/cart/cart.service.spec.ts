import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Router } from '@angular/router';
import {WalletService} from '../wallet/wallet.service';
import { of } from 'rxjs';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
describe('CartService', () => {
    let service: CartService;
    let walletService: WalletService;
    beforeEach(() => {
        let store = {};


        const routerMock = jasmine.createSpyObj('Router', ['navigate']);
        routerMock.navigate.and.returnValue(of(true));
        const mockLocalStorage = {
            getItem: (key: string): string =>
                key in store ? store[key] : null,
            setItem: (key: string, value: string) => {
                store[key] = `${value}`;
            },
            removeItem: (key: string) => {
                delete store[key];
            },
            clear: () => {
                store = {};
            },
        };

        spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
        spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
        spyOn(localStorage, 'removeItem').and.callFake(
            mockLocalStorage.removeItem
        );
        spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);
        TestBed.configureTestingModule({
            imports: [HttpClientModule, HttpClientTestingModule],
            providers: [
                {provide:CartService},
                {provide: WalletService},
                { provide: Router, useValue: routerMock }
            ],
        });
        service = TestBed.inject(CartService);
        walletService = TestBed.inject(WalletService);
    });

    describe('addItemToCart', () => {
        const item = {
            _id: 2323,
            name: 'mockName',
            tokenId: '#23',
            image: 'test.png',
            price: 20,
            count: 1,
            subTotal: 60,
        };

        it('should store the cart in localStorage', () => {
            service.addItemToCart(item);
            localStorage.setItem('cart', JSON.stringify(service.cartItems));
            expect(service.cartItems).toEqual(JSON.parse(localStorage.getItem('cart')));
        });
    });

    describe('removeCartItem', () => {
      it('should store the cart in localStorage', () => {
          localStorage.setItem('cart', JSON.stringify(service.cartItems));
          expect(service.cartItems).toEqual(JSON.parse(localStorage.getItem('cart')));
      });
  });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

});
