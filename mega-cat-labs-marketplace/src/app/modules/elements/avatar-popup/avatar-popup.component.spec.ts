import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from 'app/core/auth/auth.service';
import { AvatarPopupComponent } from './avatar-popup.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder } from '@angular/forms';

describe('AvatarPopupComponent', () => {
    let component: AvatarPopupComponent;
    let fixture: ComponentFixture<AvatarPopupComponent>;

    beforeEach(async () => {
        const authServiceMock = jasmine.createSpyObj('AuthService', ['firebaseSignUp', 'firebaseSignIn', 'firebaseSignInWithGoogle']);
        await TestBed.configureTestingModule({
            declarations: [AvatarPopupComponent],
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
        fixture = TestBed.createComponent(AvatarPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
