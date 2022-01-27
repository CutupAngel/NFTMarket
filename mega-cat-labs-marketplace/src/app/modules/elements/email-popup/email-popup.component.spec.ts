import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from 'app/core/auth/auth.service';
import { EmailPopupComponent } from './email-popup.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder } from '@angular/forms';
import {of} from 'rxjs';

describe('EmailPopupComponent', () => {
    let component: EmailPopupComponent;
    let fixture: ComponentFixture<EmailPopupComponent>;
    const authServiceMock = jasmine.createSpyObj('AuthService', ['user']);
    authServiceMock.user.and.returnValue('John Doe');

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EmailPopupComponent],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule
              ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: BsModalService },
                { provide: FormBuilder }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EmailPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
