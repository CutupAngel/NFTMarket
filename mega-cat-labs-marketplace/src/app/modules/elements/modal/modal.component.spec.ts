import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComponent } from './modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CartService } from 'app/core/cart/cart.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  const cartServiceMock = jasmine.createSpyObj('AuthService', [
    'cardProcessingFee',
    'getCartItems',
    'getItemsSum']);
  cartServiceMock.getCartItems.and.returnValue([]);
  cartServiceMock.cardProcessingFee = 2;
  cartServiceMock.getItemsSum.and.returnValue(0);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalComponent ],
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        { provide: BsModalService },
        { provide: CartService, useValue: cartServiceMock }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
