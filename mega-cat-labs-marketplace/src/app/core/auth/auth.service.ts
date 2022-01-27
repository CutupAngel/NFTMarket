import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { User } from '../user/user.types';
import { Role } from '../models/role';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { environment } from 'environments/environment';
import IdTokenResult = firebase.auth.IdTokenResult;

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public idToken: string = null;
  private _authenticated: boolean = false;
  private userData: any = null;

  /**
   * Constructor
   */
  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    private fireAuth: AngularFireAuth,
    @Inject(PLATFORM_ID) platformId: any,
  ) {
    this._authenticated = this.isValidCachedToken();
    if (this._authenticated) {
      this.userService.user = this.user;
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Setter & getter for access token
   */
  set accessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';

  }

  set idTokenCustomAuth(token: string) {
    localStorage.setItem('idTokenCustomAuth', token);
  }

  get idTokenCustomAuth(): string {
    return localStorage.getItem('idTokenCustomAuth') ?? '';
  }

  /**
   * Setter & getter for access token
   */
  set user(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  get user(): User {
    const user: User = JSON.parse(localStorage.getItem('user'));
    return user;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Update Avatar
   */
  updateAvatar(data): Observable<any> {
    console.log(this.idTokenCustomAuth);
    const localHeaders = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.idTokenCustomAuth}`
    );

    console.log(JSON.stringify(localHeaders));
    return this.httpClient
      .post(`${baseUrl}/user/updateAvatar`, data, { headers: localHeaders })
      .pipe(
        switchMap((response: any) => {
          const that = this.user;
          that.avatar = response.user.avatar;
          this.user = that;
          return of(response);
        })
      );
  }
  /**
   * Remove Avatar
   */
  removeAvatar(): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.idTokenCustomAuth}`
    );

    return this.httpClient
      .post(`${baseUrl}/user/removeAvatar`, { headers })
      .pipe(
        switchMap((response: any) => {
          // Store the user in the local storage
          const userObj = this.user;
          userObj.avatar = response.user.avatar;
          this.user = userObj;
          return of(response);
        })
      );
  }
  /**
   * Update Email
   */
  updateEmail(data): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.idTokenCustomAuth}`
    );

    return this.httpClient
      .post(`${baseUrl}/user/updateEmail`, data, { headers })
      .pipe(
        switchMap((response: any) => {
          // Store the access token in the local storage
          this.accessToken = response.token;

          // Store the user in the local storage
          this.user = response.user;

          // Store the user on the user service
          this.userService.user = response.user;

          // Return a new observable with the response
          return of(response);
        })
      );
  }
  /**
   * Update Password
   */
  updatePassword(data): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.idTokenCustomAuth}`
    );

    return this.httpClient
      .post(`${baseUrl}/user/updatePassword`, data, { headers })
      .pipe(
        switchMap((response: any) => {
          // Store the access token in the local storage
          this.accessToken = response.token;

          // Return a new observable with the response
          return of(response);
        })
      );
  }
  /**
   * Forgot password
   *
   * @param email
   */
  forgotPassword(email: string): Observable<any> {
    return this.httpClient.post(`${baseUrl}/api/auth/forgot-password`, email);
  }

  /**
   * Reset password
   *
   * @param password
   */
  resetPassword(password: string): Observable<any> {
    return this.httpClient.post(`${baseUrl}/api/auth/reset-password`, password);
  }

  /**
   * Firebase sign up with email and password
   *
   * @param email
   * @param password
   */
  public firebaseSignUp(credentials: {
    email: string;
    password: string;
  }): Observable<any> {
    const observable = new Observable((subscriber) => {
      this.fireAuth.createUserWithEmailAndPassword(credentials.email, credentials.password)
        .then((result) => {
          console.log(result.user);
          subscriber.next(result.user);
        }).catch((error) => {
          console.log('Firebase Auth sign up issue!');
          subscriber.error(error);
        });
    });

    return observable;
  }

  /**
   * Firebase sign in with email and password
   *
   * @param email
   * @param password
   */
  firebaseSignIn(credentials: {
    email: string;
    password: string;
  }): Observable<any> {
    const that = this;
    const observable = new Observable((subscriber) => {
      that.fireAuth.signInWithEmailAndPassword(credentials.email, credentials.password)
        .then(async (userCredential: firebase.auth.UserCredential) => {
          const user = await that.mapFirebaseUserCredentialsToUser(userCredential);
          const sourceObservable = that.signIn(user.email);

          sourceObservable.subscribe(
            (signInMclUserResponse) => {
              console.log('MCL user signed in after successful firebase signin', signInMclUserResponse);
            },
            (error) => {
              const errorResponse = {
                message: 'Firebase sign-in successful but MCL sign-in failed.',
                error
              };
              subscriber.error(errorResponse);
            });

          await sourceObservable.toPromise();

          subscriber.next(userCredential);
        }).catch((error) => {
          console.log(`ERROR trying to sign in with credentials ${error}`);
          subscriber.error(error);
        });
    });

    return observable;
  }

  /**
   * Sign in with Google SSO
   *
   * @param socialUser
   */
  public firebaseSignInWithGoogle(): Observable<any> {
    if (this._authenticated) {
      return throwError('User is already logged in.');
    }

    const promise = this.fireAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(async (userCredential: firebase.auth.UserCredential) => {
        const user = await this.mapFirebaseUserCredentialsToUser(userCredential);
        this.updateUserInformation(user);
        return userCredential;
      });

    return from(promise);
  }

  public firebaseSignOut(): Observable<any> {
    const promise = this.fireAuth.signOut();
    return from(promise);
  }

  getToken(): string {
    let userToken: string = null;
    this.fireAuth.onAuthStateChanged((user) => {
      if (user) {
        user.getIdToken().then((idToken) => {
          userToken = idToken;
          this.idToken = idToken;
        });
      }
    });

    return userToken;
  }

  lookupEmail(username): Observable<any> {
    const data = {
      userName: username
    };
    return this.httpClient
      .post(`${baseUrl}/auth/lookupEmail/`, data);
  }

  saveUserUsingJWTGoogle(idToken) {
    const data = {
      idToken: idToken
    };
    return this.httpClient.post(`${baseUrl}/auth/loginWithJwt/`, data)
      .pipe(
        switchMap((response: any) => {
          this.updateRoleAndAuth(response);
          return of(response);
        })
      );
  }

  /**
   * Sign in
   *
   * @param credentials
   */
  signIn(email): Observable<any> {
    console.log('inside old signin');
    return this.httpClient
      .post(`${baseUrl}/auth/loginUserFirebase/`, {
        email
      })
      .pipe(
        switchMap((response: any) => {
          this.updateUserInformation(response.user);
          this.updateRoleAndAuth(response);
          return of(response);
        })
      );
  }

  /**
   * Sign in using the access token
   */
  signInUsingToken(): Observable<any> {
    // Renew token
    return this.httpClient
      .post('api/auth/refresh-access-token', {
        accessToken: this.accessToken,
      })
      .pipe(
        catchError(() =>
          // Return false
          of(false)
        ),
        switchMap((response: any) => {
          this.accessToken = this.accessToken;
          this._authenticated = true;
          this.userService.user = this.user;

          return of(true);
        })
      );
  }

  /**
   * Sign out
   */
  signOut(): Observable<any> {
    localStorage.removeItem('accessToken');
    this._authenticated = false;

    if (this.user && this.user.isFirebaseUser) {
      this.firebaseSignOut();
    }

    this.user = null;
    this.userService.user = null;
    this.idTokenCustomAuth = null;
    return of(true);
  }

  /**
   * Sign up
   *
   * @param user
   */
  signUp(user: {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.httpClient.post(`${baseUrl}/auth/createUserFirebase/`, user).pipe(
      switchMap((response: any) => {
        this.user = response.user;
        this.updateRoleAndAuth(response);
        return of(response);
      })
    );
  }

  /**
   * Unlock session
   *
   * @param credentials
   */
  unlockSession(credentials: {
    email: string;
    password: string;
  }): Observable<any> {
    return this.httpClient.post('api/auth/unlock-session', credentials);
  }

  /**
   * Check the authentication status
   */
  check(): Observable<boolean> {
    // Check if the user is logged in
    if (this._authenticated) {
      return of(true);
    }

    if (!this.isValidCachedToken()) {
      return of(false);
    }

    // If the access token exists and it didn't expire, sign in using it
    if (this.user && this.user.isFirebaseUser) {
      if (this.user.firebaseUser && this.user.firebaseUser.hasOwnProperty('reload')) {
        console.log('Refreshing firebase user!');
        this.user.firebaseUser.reload();
        return of(true);
      }

      return of(false);
    } else {
      return this.signInUsingToken();
    }
  }

  isAdmin(): Observable<any> {
    if (this.user && this.user.role === Role.Admin) {
      return of(true);
    } else {
      return of(false);
    }
  }

  private updateRoleAndAuth(response: any) {
    console.log('updateRoleAndAuth', response);
    const user = this.user;
    if (response.user.role === 1) {
      user.role = Role.Admin;
    } else if (response.user.role === 0) {
      user.role = Role.User;
    } else if (response.user.role === 2) {
      user.role = Role.SuperUser;
    }
    user.avatar = response.user.avatar;
    this.user = user;
    this.idTokenCustomAuth = response.token;
  }
  /**
   * This method maps the UserCredential model returned by Firebase auth to the User model we maintain in the
   * marketplace app. We left some unused variables in the code to demonstrate how to access important fields.
   *
   * @param userCredential: firebase.auth.UserCredential
   * @private
   */
  private async mapFirebaseUserCredentialsToUser(userCredential: firebase.auth.UserCredential): Promise<User> {
    // UserInfo fields
    const user: firebase.User = userCredential.user;
    const displayName = user.displayName;
    const email = user.email;
    const phoneNumber = user.phoneNumber;
    const photoUrl = user.photoURL;
    const providerId = user.providerId;
    const userId = user.uid;

    // User fields (extends UserInfo)
    const tenantId = user.tenantId;

    // AdditionalUserInfo fields
    const username = userCredential.additionalUserInfo.username;
    const profile = userCredential.additionalUserInfo.profile; // map containing IDP-specific user data

    const idToken: IdTokenResult = await user.getIdTokenResult();
    const token = idToken.token; // Firebase Auth ID token JWT string
    const signInProvider = idToken.signInProvider; // Sign-In provider the ID token was obtained

    const googleMappedUser: User = {
      id: userId,
      name: displayName,
      email: email,
      avatar: photoUrl,
      status: null,
      role: Role.Admin,
      accessToken: token,
      isFirebaseUser: true,
      firebaseUser: user
    };

    return googleMappedUser;
  }

  private updateUserInformation(user: User) {
    console.log('Updating user information', user);
    this.accessToken = user.accessToken;
    this._authenticated = true;
    this.user = user;
    this.userService.user = user;
  }

  private isValidCachedToken() {
    return Boolean(this.accessToken && !AuthUtils.isTokenExpired(this.accessToken));
  }
}
