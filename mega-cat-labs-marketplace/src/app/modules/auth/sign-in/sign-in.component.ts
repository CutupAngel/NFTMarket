import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RoutesRecognized } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { SocialAuthService, GoogleLoginProvider, SocialUser } from 'angularx-social-login';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { RouteMonitorService } from '../../../shared/route-monitor.service';

@Component({
  selector: 'auth-sign-in',
  templateUrl: './sign-in.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class AuthSignInComponent implements OnInit {
  @ViewChild('signInNgForm') signInNgForm: NgForm;

  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: ''
  };
  signInForm: FormGroup;
  showAlert: boolean = false;

  /**
   * Constructor
   */
  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private socialAuthService: SocialAuthService,
    private routeMonitorService: RouteMonitorService
  ) { }

  /**
   * On init
   */
  ngOnInit(): void {
    this.signInForm = this.formBuilder.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: ['']
    });

    console.log(`Previous route was ${this.routeMonitorService.getPreviousUrl()}`);
  }

  /**
   * Sign in
   */
  signIn(): void {
    if (this.signInForm.invalid) {
      return;
    }

    this.signInForm.disable();
    this.showAlert = false;
    const usernameOrEmail = this.signInForm.value.usernameOrEmail;

    let email;
    if (this.isEmail(usernameOrEmail)) {
      email = usernameOrEmail;
      this.logInWithEmail(email);
    } else {
      this.lookupEmailFromUsername(usernameOrEmail).subscribe((res: any) => {
        this.logInWithEmail(res.email);
      },
        error => this.handleError('Username does not exist.')
      );
    }
  }

  /**
   * Google SSO
   */
  public async signInWithGoogle() {
    console.log('id token: ' + this.authService.getToken());
    this.authService.firebaseSignInWithGoogle()
      .subscribe(
        (user: firebase.auth.UserCredential) => {
          console.log(`SIGN IN GOOGLE : User logged in ${user}, redirecting`);
          this.authService.saveUserUsingJWTGoogle(this.authService.idToken).subscribe(() => {
            console.log('create account using jwt returned');
            this.router.navigateByUrl(this.routeMonitorService.getPreviousUrl());
          });
        },
        error => this.handleError(error)
      );
  }

  private isEmail(usernameOrEmail: any) {
    return (usernameOrEmail.indexOf('@') >= 1);
  }

  private logInWithEmail(email: string) {
    const credentials = {
      email: email,
      password: this.signInForm.value.password
    };

    this.authService.firebaseSignIn(credentials)
      .subscribe(
        (user: firebase.auth.UserCredential) => {
          console.log(`SIGN IN NORMAL : User logged in ${user}, redirecting`);
          const oldRoute = this.routeMonitorService.getPreviousUrl();
          this.router.navigate([oldRoute]);
        },
        error => this.handleError(error.message)
      );
  }

  private handleError(errorMessage) {
    this.signInForm.enable();
    this.signInNgForm.resetForm();
    this.alert = {
      type: 'error',
      message: errorMessage ? errorMessage : 'Wrong email, password, or you are not registered.'
    };
    this.showAlert = true;
  }

  private lookupEmailFromUsername(username: any): Observable<any> {
    return this.authService.lookupEmail(username);
  }
}
