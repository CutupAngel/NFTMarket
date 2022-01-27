import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentDetailsPopupComponent } from './payment-details-popup.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from 'app/core/auth/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CartService  } from 'app/core/cart/cart.service';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder } from '@angular/forms';

describe('PaymentDetailsPopupComponent', () => {
  let component: PaymentDetailsPopupComponent;
  let fixture: ComponentFixture<PaymentDetailsPopupComponent>;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['user']);
  authServiceMock.user.and.returnValue(null);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentDetailsPopupComponent ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: BsModalService },
        { provide: FormBuilder },
        { provide: CartService },
      ]
    })
    .compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
