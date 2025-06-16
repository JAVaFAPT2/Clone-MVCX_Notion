import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const apiDebugInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 9);
  
  // Log the request
  console.group(`🌐 API Request [${requestId}]: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.groupEnd();

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        const duration = Date.now() - startTime;
        
        // Log the successful response
        console.group(`✅ API Response [${requestId}]: ${req.method} ${req.url} (${duration}ms)`);
        console.log('Status:', event.status);
        console.log('Body:', event.body);
        console.groupEnd();
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const duration = Date.now() - startTime;
      
      // Log the error response
      console.group(`❌ API Error [${requestId}]: ${req.method} ${req.url} (${duration}ms)`);
      console.log('Status:', error.status);
      console.log('Error:', error.error);
      console.log('Message:', error.message);
      console.trace('Stack trace:');
      console.groupEnd();
      
      return throwError(() => error);
    })
  );
}; 