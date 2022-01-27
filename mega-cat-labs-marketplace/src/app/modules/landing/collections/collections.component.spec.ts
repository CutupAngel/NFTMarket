import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingCollectionsComponent } from './collections.component';
import { ProductService } from '../../../core/product/product.service';
import { CartService } from '../../../core/cart/cart.service';
import {ActivatedRoute, Router} from '@angular/router';
import {from} from 'rxjs';
import {FormBuilder} from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ErrorsService } from 'app/core/errors/errors.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('CollectionsComponent', () => {
  let component: LandingCollectionsComponent;
  let fixture: ComponentFixture<LandingCollectionsComponent>;

  beforeEach(async () => {
    const productServiceMock = jasmine.createSpyObj('ProductService', ['getSaleNFTs','listForSale', 'filterProducts', 'searchProducts','getAllListings']);
    const fakeProducts = [];
    productServiceMock.getSaleNFTs.and.returnValue(from(fakeProducts));
    productServiceMock.getAllListings.and.returnValue(from(fakeProducts));
    productServiceMock.listForSale.and.returnValue(from(fakeProducts));
    productServiceMock.filterProducts.and.returnValue(from(fakeProducts));
    productServiceMock.searchProducts.and.returnValue(from(fakeProducts));

    await TestBed.configureTestingModule({
      declarations: [ LandingCollectionsComponent ],
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule
      ],
      providers: [
          { provide: FormBuilder, useValue: jasmine.createSpyObj('FormBuilder', ['group']) },
          { provide: ProductService, useValue: productServiceMock },
          { provide: Router, useValue: jasmine.createSpy('routerMock') },
          { provide: ActivatedRoute, useValue: jasmine.createSpy('activatedRouteMock') },
          { provide: CartService },
          { provide: BsModalService },
          { provide: ErrorsService },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
