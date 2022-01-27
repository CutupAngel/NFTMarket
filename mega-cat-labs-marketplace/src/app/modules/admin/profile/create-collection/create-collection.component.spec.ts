import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from 'app/core/auth/auth.service';
import { ProductService } from 'app/core/product/product.service';
import { CreateCollectionComponent } from './create-collection.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {FormBuilder} from '@angular/forms';
import { of } from 'rxjs';
import { ErrorsService } from '../../../../core/errors/errors.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
describe('CreateCollectionComponent', () => {
  let component: CreateCollectionComponent;
  let fixture: ComponentFixture<CreateCollectionComponent>;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['check']);
  authServiceMock.check.and.returnValue(of(true));



  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateCollectionComponent ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,

      ],
      providers: [
          { provide: AuthService, useValue: authServiceMock },
          { provide: BsModalService, useValue: {} },
          { provide : ActivatedRoute,
            useValue: {
              params: of({id: 123})
            }},

          { provide: FormBuilder },
          { provide : ProductService},
          { provide: ErrorsService, useValue: {} },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
