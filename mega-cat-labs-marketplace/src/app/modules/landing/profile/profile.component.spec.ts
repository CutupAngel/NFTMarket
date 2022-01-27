import { ComponentFixture, TestBed } from '@angular/core/testing';
import {FormBuilder} from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { ProductService } from 'app/core/product/product.service';
import { CartService  } from 'app/core/cart/cart.service';
import { VenlyService } from 'app/core/venly/venly.service';
import { ProfileComponent } from './profile.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ErrorsService } from 'app/core/errors/errors.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {of} from 'rxjs';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['user', 'check']);
  authServiceMock.user.and.returnValue('John Doe');
  authServiceMock.check.and.returnValue(of(true));

  beforeEach(async () => {
    let store = {};
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
    await TestBed.configureTestingModule({
      declarations: [ ProfileComponent ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: FormBuilder },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ProductService },
        { provide: CartService },
        { provide: BsModalService },
        { provide: VenlyService },
        { provide: ErrorsService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
