import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SnackbarService } from '../services/snackbar.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const snackbar = inject(SnackbarService);
  // Token is stored in an httpOnly cookie — attach withCredentials so the
  // browser sends it automatically with every request.
  const clonedRequest = req.clone({ withCredentials: true });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred';

      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad request';
          snackbar.error(errorMessage);
          break;
        case 401:
          // Expected when user is not logged in — silently pass through.
          errorMessage = 'You are not authorized. Please log in.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          snackbar.error(errorMessage);
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          snackbar.error(errorMessage);
          break;
        case 500:
          errorMessage = error.error?.message || 'Internal server error';
          snackbar.error(errorMessage);
          break;
        default:
          errorMessage = error.message;
          snackbar.error(errorMessage);
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};
