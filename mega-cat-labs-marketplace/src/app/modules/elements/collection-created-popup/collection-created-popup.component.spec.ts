import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionCreatedPopupComponent } from './collection-created-popup.component';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';

describe('CollectionCreatedPopupComponent', () => {
  let component: CollectionCreatedPopupComponent;
  let fixture: ComponentFixture<CollectionCreatedPopupComponent>;
  const modalMock = jasmine.createSpyObj('ModalOptions', ['initialState']);
  modalMock.initialState = {
    collection: {
      name: 'hi',
      description: 'hello',
      image: 'https://google.com',
      symbol: 'hi',
      confirmed: 'false',
      transactionHash: 'txHash',
      secretType: 'MATIC'
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionCreatedPopupComponent ],
      imports: [],
      providers: [
        { provide: BsModalRef, useValue: jasmine.createSpyObj('BsModalRef', ['']) },
        { provide: ModalOptions, useValue: modalMock },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['']) },
        ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionCreatedPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
