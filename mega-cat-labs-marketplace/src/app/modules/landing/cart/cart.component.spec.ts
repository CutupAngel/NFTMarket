import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartService } from 'app/core/cart/cart.service';
import { AuthService } from 'app/core/auth/auth.service';
import { CartComponent } from './cart.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import {FormBuilder} from '@angular/forms';
import { of } from 'rxjs';
import { ErrorsService } from '../../../core/errors/errors.service';
import {WalletService} from '../../../core/wallet/wallet.service';

describe('CartComponent', () => {
    let component: CartComponent;
    let fixture: ComponentFixture<CartComponent>;
    const authServiceMock = jasmine.createSpyObj('AuthService', ['check']);
    authServiceMock.check.and.returnValue(of(true));
    const cartServiceMock = jasmine.createSpyObj('AuthService', [
      'cardProcessingFee',
      'getCartItems',
      'getItemsSum']);
    cartServiceMock.getCartItems.and.returnValue([]);
    cartServiceMock.cardProcessingFee = 2;
    cartServiceMock.getItemsSum.and.returnValue(0);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CartComponent],
            imports: [
              HttpClientTestingModule,
              RouterTestingModule
            ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: CartService, useValue: cartServiceMock },
                { provide: BsModalService },
                { provide: FormBuilder },
                { provide: WalletService },
                { provide: ErrorsService, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
