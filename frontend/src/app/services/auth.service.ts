import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'jwt_token';

  constructor(private http: HttpClient) {}

  login(credentials: { usernameOrEmail: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signin`, credentials, { 
      withCredentials: true // Enable cookies
    }).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem(this.tokenKey, res.token);
        }
      })
    );
  }

  register(userData: { username: string; email: string; password: string; role: string[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/signout`, {}, { 
      withCredentials: true 
    }).pipe(
      tap(() => {
        localStorage.removeItem(this.tokenKey);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Cookie-based methods
  setPreferences(preferences: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/preferences`, preferences, { 
      withCredentials: true 
    });
  }

  getPreferences(): Observable<any> {
    return this.http.get(`${this.apiUrl}/preferences`, { 
      withCredentials: true 
    });
  }

  // Storage API methods
  setStorageItem(key: string, value: string): Observable<any> {
    return this.http.post('/api/storage/set', { key, value });
  }

  getStorageItem(key: string): Observable<any> {
    return this.http.get(`/api/storage/get/${key}`);
  }

  removeStorageItem(key: string): Observable<any> {
    return this.http.delete(`/api/storage/remove/${key}`);
  }

  clearStorage(): Observable<any> {
    return this.http.delete('/api/storage/clear');
  }

  hasStorageItem(key: string): Observable<any> {
    return this.http.get(`/api/storage/has/${key}`);
  }

  // Helper to decode JWT and extract userId
  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || null;
    } catch (e) {
      return null;
    }
  }

  getCurrentUser(): any {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          id: payload.id,
          username: payload.username,
          email: payload.email,
          roles: payload.roles
        };
      } catch (error) {
        console.error('Error parsing token:', error);
        return null;
      }
    }
    return null;
  }
} 