import { RouteMonitorService } from './../../shared/route-monitor.service';
import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor
{
    /**
     * Constructor
     */
    constructor(private authService: AuthService, private router: Router) {}

    /**
     * Intercept
     *
     * @param req
     * @param next
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {
        // Clone the request object
        let newRequest;

        // Request
        //
        // If the access token didn't expire, add the Authorization header.
        // We won't add the Authorization header if the access token expired.
        // This will force the server to return a "401 Unauthorized" response
        // for the protected API routes which our response interceptor will
        // catch and delete the access token from the local storage while logging
        // the user out from the app.
        if ( this.authService.accessToken && !AuthUtils.isTokenExpired(this.authService.accessToken) )
        {
            newRequest = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + this.authService.accessToken)
            });
        } else {
          newRequest = req.clone();
        }

        return next.handle(newRequest).pipe(
            catchError((error) => {

                if (error instanceof HttpErrorResponse && error.status === 401)
                {
                  this.authService.signOut();
                  this.router.navigate(['/sign-in']);
                }

                return throwError(error);
            })
        );
    }
}
