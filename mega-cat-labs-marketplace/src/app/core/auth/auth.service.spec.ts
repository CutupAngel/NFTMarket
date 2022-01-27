import { TestBed } from '@angular/core/testing';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from 'environments/environment';
import { UserService } from '../user/user.service';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { User } from '../user/user.types';
import { Role } from '../models/role';

const baseUrl = environment.apiUrl;

describe('AuthService', () => {
    let service: AuthService;
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;

    const mockUser: User = {
      id: '_093824',
      name: '_093824',
      email:'_093824',
      avatar: '_093824',
      status: '_093824',
      accessToken:'_093824',
      role: Role.Admin,
      isFirebaseUser: false,
      firebaseUser: null
    };

    beforeEach(() => {
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

        TestBed.configureTestingModule({
            imports: [
              AngularFireModule.initializeApp(environment.firebase),
              AngularFireAuthModule,
              HttpClientTestingModule],
            providers: [
              { provide: HttpClient },
              { provide: UserService },
            ],
        });

        service = TestBed.inject(AuthService);
        service.user = mockUser;
        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    describe('setAccessToken', () => {
        it('should store the token in localStorage', () => {
            const spiez = spyOnProperty(service, 'accessToken', 'set');
            service.accessToken = '';
            expect(spiez).toHaveBeenCalled();
            expect(localStorage.getItem('accessToken')).toEqual(null);
        });
    });

    describe('getAccessToken', () => {
        it('should get the token from localStorage', () => {
            spyOnProperty(service, 'accessToken', 'get').and.returnValue('');
            expect(service.accessToken).toBe('');
            localStorage.setItem('accessToken', '');
            expect(service.accessToken).toEqual('');
        });
    });

    it('should create the service', () => {
        expect(service).toBeTruthy();
    });

    it('should perform login correctly', (done) => {
        const responseObject = {
            user: mockUser,
            accessToken: 'sometoken',
            token: 'anothertoken'
        };
        let response = null;
        const mockResponse = {
            status: '200',
        };
        const data = {
            username: 'hpzp8yyo5l6f9e8lbqqy4748xt7yc8hc',
            password: 'rpcB8VAZHT1XXePgHDahOXD9r0kDpRBL',
            email : 'test@test.com'
        };
        service.signIn('test@test.com').subscribe(
            (receivedResponse: any) => {
                response = receivedResponse;
                expect(mockResponse.status.toString()).toEqual('200');
                done();
            },
            (error: any) => {}
        );
        const requestWrapper = httpTestingController.expectOne({
            url: `${baseUrl}/auth/loginUserFirebase/`,
        });
        expect(requestWrapper.request.method).toEqual('POST');
        requestWrapper.flush(responseObject);
    });

    it('should update avatar correctly', (done) => {
        const responseObject = {
            user: 'auth',
            accessToken: 'sometoken',
        };
        let response = null;
        const mockResponse = {
            status: '200',
        };
        const data = {
            file: 'prfile.png',
        };
        service.updateAvatar(data).subscribe(
            (receivedResponse: any) => {
                response = receivedResponse;
                expect(mockResponse.status.toString()).toEqual('200');
                done();
            },
            (error: any) => {}
        );
        const requestWrapper = httpTestingController.expectOne({
            url: `${baseUrl}/user/updateAvatar`,
        });
        expect(requestWrapper.request.method).toEqual('POST');
        requestWrapper.flush(responseObject);
    });

    it('should remove avatar correctly', (done) => {
        const responseObject = {
            user: 'auth',
            accessToken: 'sometoken',
        };
        let response = null;
        const mockResponse = {
            status: '200',
        };

        service.removeAvatar().subscribe(
            (receivedResponse: any) => {
                response = receivedResponse;
                expect(mockResponse.status.toString()).toEqual('200');
                done();
            },
            (error: any) => {}
        );
        const requestWrapper = httpTestingController.expectOne({
            url: `${baseUrl}/user/removeAvatar`,
        });
        expect(requestWrapper.request.method).toEqual('POST');
        requestWrapper.flush(responseObject);
    });

    it('should update email correctly', (done) => {
        const responseObject = {
            user: 'auth',
            accessToken: 'sometoken',
        };
        let response = null;
        const mockResponse = {
            status: '200',
        };
        const data = 'test@gmail.com';

        service.updateEmail(data).subscribe(
            (receivedResponse: any) => {
                response = receivedResponse;
                expect(mockResponse.status.toString()).toEqual('200');
                done();
            },
            (error: any) => {}
        );
        const requestWrapper = httpTestingController.expectOne({
            url: `${baseUrl}/user/updateEmail`,
        });
        expect(requestWrapper.request.method).toEqual('POST');
        requestWrapper.flush(responseObject);
    });

    it('should update password correctly', (done) => {
        const responseObject = {
            user: 'auth',
            accessToken: 'sometoken',
        };
        let response = null;
        const mockResponse = {
            status: '200',
        };
        const data = 'newPassword';

        service.updatePassword(data).subscribe(
            (receivedResponse: any) => {
                response = receivedResponse;
                expect(mockResponse.status.toString()).toEqual('200');
                done();
            },
            (error: any) => {}
        );
        const requestWrapper = httpTestingController.expectOne({
            url: `${baseUrl}/user/updatePassword`,
        });
        expect(requestWrapper.request.method).toEqual('POST');
        requestWrapper.flush(responseObject);
    });

    it('should send reset password link correctly', (done) => {
        const responseObject = {
            message: 'link send successfully',
        };
        let response = null;
        const mockResponse = {
            status: '200',
        };
        const data = 'test@gmail.com';

        service.forgotPassword(data).subscribe(
            (receivedResponse: any) => {
                response = receivedResponse;
                expect(mockResponse.status.toString()).toEqual('200');
                done();
            },
            (error: any) => {}
        );
        const requestWrapper = httpTestingController.expectOne({
            url: `${baseUrl}/api/auth/forgot-password`,
        });
        expect(requestWrapper.request.method).toEqual('POST');
        requestWrapper.flush(responseObject);
    });

    it('should send reset password correctly', (done) => {
        const responseObject = {
            user: 'auth',
            accessToken: 'sometoken',
        };
        let response = null;
        const mockResponse = {
            status: '200',
        };
        const data = 'newPassword';

        service.resetPassword(data).subscribe(
            (receivedResponse: any) => {
                response = receivedResponse;
                expect(mockResponse.status.toString()).toEqual('200');
                done();
            },
            (error: any) => {}
        );
        const requestWrapper = httpTestingController.expectOne({
            url: `${baseUrl}/api/auth/reset-password`,
        });
        expect(requestWrapper.request.method).toEqual('POST');
        requestWrapper.flush(responseObject);
    });

    it('should perform register correctly', (done) => {
        const responseObject = {
            user: mockUser,
            accessToken: 'sometoken',
        };
        let response = null;
        const mockResponse = {
            status: '200',
        };
        const data = {
            userName: 'test',
            firstName: 'test1',
            lastName: 'test2',
            email: 'test@gmail.com',
            password: 'test123',
        };

        service.signUp(data).subscribe(
            (receivedResponse: any) => {
                response = receivedResponse;
                expect(mockResponse.status.toString()).toEqual('200');
                done();
            },
            (error: any) => {}
        );
        const requestWrapper = httpTestingController.expectOne({
            url: `${baseUrl}/auth/createUserFirebase/`,
        });
        expect(requestWrapper.request.method).toEqual('POST');
        requestWrapper.flush(responseObject);
    });
});
