import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from 'app/core/auth/auth.service';
import { PasswordPopupComponent } from './password-popup.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder } from '@angular/forms';

describe('PasswordPopupComponent', () => {
    let component: PasswordPopupComponent;
    let fixture: ComponentFixture<PasswordPopupComponent>;
    const authServiceMock = jasmine.createSpyObj('AuthService', ['user']);
    authServiceMock.user.and.returnValue('John Doe');

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PasswordPopupComponent],
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
        fixture = TestBed.createComponent(PasswordPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
