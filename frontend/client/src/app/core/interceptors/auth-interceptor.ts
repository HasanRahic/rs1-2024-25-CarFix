import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const clonedRequest = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred';

      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad request';
          console.error('400 Bad Request:', errorMessage);
          break;
        case 401:
          errorMessage = 'You are not authorized. Please log in.';
          console.error('401 Unauthorized:', errorMessage);
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          console.error('403 Forbidden:', errorMessage);
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          console.error('404 Not Found:', errorMessage);
          break;
        case 500:
          errorMessage = error.error?.message || 'Internal server error';
          console.error('500 Server Error:', errorMessage);
          break;
        default:
          errorMessage = error.message;
          console.error(`HTTP Error ${error.status}:`, errorMessage);
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};
