import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DebugService } from './debug.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const debugService = inject(DebugService);
  const token = localStorage.getItem('jwt_token');
  
  debugService.log('auth', `Processing request to ${req.url}`);
  
  if (token) {
    debugService.log('auth', 'Adding JWT token to request');
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }
  
  debugService.log('auth', 'No JWT token found, proceeding without authentication');
  return next(req);
}; 