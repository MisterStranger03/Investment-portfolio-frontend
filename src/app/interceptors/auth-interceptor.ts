import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../services/auth'; // Correct the import path
import { environment } from '../../environments/environment'; // <-- Import the environment file

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const backendUrl = environment.backendUrl; // <-- Get the backend URL from the environment

  // --- THIS IS THE FIX ---
  // Check if the request is going to our configured backend API
  const isApiRequest = req.url.startsWith(`${backendUrl}/api/`);
  // -------------------------

  if (authService.isAuthenticated() && isApiRequest) {
    // If authenticated and it's an API request, get the token asynchronously
    return from(authService.getToken()).pipe(
      switchMap(token => {
        if (token) {
          // Clone the request and add the Authorization header
          const clonedReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
          });
          return next(clonedReq);
        }
        // If no token, pass the original request
        return next(req);
      })
    );
  }

  // If not authenticated or not an API request, pass it through unchanged
  return next(req);
};