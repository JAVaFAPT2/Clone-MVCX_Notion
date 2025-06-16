import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class ApiDebugInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 9);
    
    // Log the request
    console.group(`🌐 API Request [${requestId}]: ${request.method} ${request.url}`);
    console.log('Headers:', request.headers);
    console.log('Body:', request.body);
    console.groupEnd();

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          
          // Log the successful response
          console.group(`✅ API Response [${requestId}]: ${request.method} ${request.url} (${duration}ms)`);
          console.log('Status:', event.status);
          console.log('Body:', event.body);
          console.groupEnd();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const duration = Date.now() - startTime;
        
        // Log the error response
        console.group(`❌ API Error [${requestId}]: ${request.method} ${request.url} (${duration}ms)`);
        console.log('Status:', error.status);
        console.log('Error:', error.error);
        console.log('Message:', error.message);
        console.trace('Stack trace:');
        console.groupEnd();
        
        return throwError(() => error);
      })
    );
  }
} 