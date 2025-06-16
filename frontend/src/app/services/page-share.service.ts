import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface PageShare {
  id: string;
  pageId: string;
  sharedByUserId: string;
  sharedWithUserId?: string;
  permission: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  shareLink?: string;
  isPublic: boolean;
}

export interface Permission {
  value: string;
  description: string;
}

export interface ShareRequest {
  userId: string;
  permission: string;
}

export interface PublicShareRequest {
  permission: string;
  expiresAt?: string;
}

export interface AccessCheckRequest {
  permission: string;
}

@Injectable({
  providedIn: 'root'
})
export class PageShareService {
  private sharesSubject = new BehaviorSubject<PageShare[]>([]);
  private currentPageId: string | null = null;

  constructor(private http: HttpClient) {}

  initializeShares(pageId: string): void {
    this.currentPageId = pageId;
    this.loadShares();
  }

  sharePageWithUser(userId: string, permission: string): Observable<PageShare> {
    if (!this.currentPageId) {
      throw new Error('No page selected for sharing');
    }

    const payload: ShareRequest = {
      userId,
      permission
    };

    return this.http.post<PageShare>(`/api/shares/page/${this.currentPageId}/share`, payload)
      .pipe(
        tap(share => {
          const currentShares = this.sharesSubject.value;
          this.sharesSubject.next([...currentShares, share]);
        })
      );
  }

  createPublicShare(permission: string, expiresAt?: string): Observable<PageShare> {
    if (!this.currentPageId) {
      throw new Error('No page selected for sharing');
    }

    const payload: PublicShareRequest = {
      permission,
      expiresAt
    };

    return this.http.post<PageShare>(`/api/shares/page/${this.currentPageId}/public`, payload)
      .pipe(
        tap(share => {
          const currentShares = this.sharesSubject.value;
          this.sharesSubject.next([...currentShares, share]);
        })
      );
  }

  getSharesForPage(): Observable<PageShare[]> {
    return this.sharesSubject.asObservable();
  }

  getCurrentShares(): PageShare[] {
    return this.sharesSubject.value;
  }

  getSharesByUser(): Observable<PageShare[]> {
    return this.http.get<PageShare[]>('/api/shares/by-user');
  }

  getSharesWithUser(): Observable<PageShare[]> {
    return this.http.get<PageShare[]>('/api/shares/with-user');
  }

  getShareByLink(shareLink: string): Observable<PageShare> {
    return this.http.get<PageShare>(`/api/shares/link/${shareLink}`);
  }

  checkAccess(permission: string): Observable<boolean> {
    if (!this.currentPageId) {
      throw new Error('No page selected for access check');
    }

    const payload: AccessCheckRequest = {
      permission
    };

    return this.http.post<{hasAccess: boolean}>(`/api/shares/page/${this.currentPageId}/access`, payload)
      .pipe(map(response => response.hasAccess));
  }

  revokeShare(userId: string): Observable<void> {
    if (!this.currentPageId) {
      throw new Error('No page selected for sharing');
    }

    return this.http.delete<void>(`/api/shares/page/${this.currentPageId}/user/${userId}`)
      .pipe(
        tap(() => {
          const currentShares = this.sharesSubject.value;
          const updatedShares = currentShares.filter(share => share.sharedWithUserId !== userId);
          this.sharesSubject.next(updatedShares);
        })
      );
  }

  revokePublicShare(): Observable<void> {
    if (!this.currentPageId) {
      throw new Error('No page selected for sharing');
    }

    return this.http.delete<void>(`/api/shares/page/${this.currentPageId}/public`)
      .pipe(
        tap(() => {
          const currentShares = this.sharesSubject.value;
          const updatedShares = currentShares.filter(share => !share.isPublic);
          this.sharesSubject.next(updatedShares);
        })
      );
  }

  updateSharePermission(userId: string, newPermission: string): Observable<PageShare> {
    if (!this.currentPageId) {
      throw new Error('No page selected for sharing');
    }

    const payload = {
      permission: newPermission
    };

    return this.http.put<PageShare>(`/api/shares/page/${this.currentPageId}/user/${userId}/permission`, payload)
      .pipe(
        tap(updatedShare => {
          const currentShares = this.sharesSubject.value;
          const updatedShares = currentShares.map(share => 
            share.sharedWithUserId === userId ? updatedShare : share
          );
          this.sharesSubject.next(updatedShares);
        })
      );
  }

  getAvailablePermissions(): Observable<{permissions: Permission[], descriptions: Record<string, string>}> {
    return this.http.get<{permissions: Permission[], descriptions: Record<string, string>}>('/api/shares/permissions');
  }

  cleanupExpiredShares(): Observable<number> {
    return this.http.post<{cleanedShares: number}>('/api/shares/cleanup', {})
      .pipe(map(response => response.cleanedShares));
  }

  private loadShares(): void {
    if (!this.currentPageId) return;

    this.http.get<PageShare[]>(`/api/shares/page/${this.currentPageId}`)
      .subscribe({
        next: (shares) => this.sharesSubject.next(shares),
        error: (error) => console.error('Failed to load shares:', error)
      });
  }

  clearShares(): void {
    this.currentPageId = null;
    this.sharesSubject.next([]);
  }

  // Helper methods
  getPermissionDescription(permission: string): string {
    const descriptions: Record<string, string> = {
      'VIEW': 'Can view the page',
      'COMMENT': 'Can view and add comments',
      'EDIT': 'Can view, comment, and edit the page',
      'ADMIN': 'Full access including sharing and deletion'
    };
    return descriptions[permission] || permission;
  }

  formatExpirationDate(expiresAt: string): string {
    if (!expiresAt) return 'Never expires';
    
    const date = new Date(expiresAt);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 0) {
      return 'Expired';
    } else if (diffInHours < 24) {
      return `Expires in ${Math.floor(diffInHours)}h`;
    } else {
      return `Expires on ${date.toLocaleDateString()}`;
    }
  }

  isExpired(expiresAt?: string): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  getShareUrl(shareLink: string): string {
    return `${window.location.origin}/shared/${shareLink}`;
  }
} 