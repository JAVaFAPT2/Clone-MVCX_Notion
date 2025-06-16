import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CursorPosition {
  x: number;
  y: number;
}

export interface SelectionPosition {
  from: number;
  to: number;
}

export interface UserPresence {
  userId: string;
  username: string;
  cursor?: CursorPosition;
  selection?: SelectionPosition;
  lastSeen: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private currentPageId: string | null = null;
  private currentUserId: string | null = null;
  private currentUsername: string | null = null;
  private presenceInterval: any;
  private presenceSubject = new BehaviorSubject<UserPresence[]>([]);

  constructor(private http: HttpClient) {}

  initializePresence(pageId: string, userId: string, username: string): void {
    this.currentPageId = pageId;
    this.currentUserId = userId;
    this.currentUsername = username;

    // Start presence updates
    this.startPresenceUpdates();
  }

  updateCursor(cursor: CursorPosition): void {
    if (!this.currentPageId || !this.currentUserId) return;

    this.http.post(`/api/collaborative/pages/${this.currentPageId}/presence`, {
      userId: this.currentUserId,
      username: this.currentUsername,
      cursor,
      lastSeen: new Date()
    }).subscribe();
  }

  updateSelection(selection: SelectionPosition): void {
    if (!this.currentPageId || !this.currentUserId) return;

    this.http.post(`/api/collaborative/pages/${this.currentPageId}/presence`, {
      userId: this.currentUserId,
      username: this.currentUsername,
      selection,
      lastSeen: new Date()
    }).subscribe();
  }

  getPresence(): Observable<UserPresence[]> {
    return this.presenceSubject.asObservable();
  }

  private startPresenceUpdates(): void {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
    }

    // Update presence every 5 seconds
    this.presenceInterval = setInterval(() => {
      this.loadPresence();
    }, 5000);

    // Load initial presence
    this.loadPresence();
  }

  private loadPresence(): void {
    if (!this.currentPageId) return;

    this.http.get<UserPresence[]>(`/api/collaborative/pages/${this.currentPageId}/presence`)
      .subscribe({
        next: (presence) => {
          this.presenceSubject.next(presence);
        },
        error: (error) => {
          console.error('Error loading presence:', error);
        }
      });
  }

  disconnect(): void {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
      this.presenceInterval = null;
    }

    if (this.currentPageId && this.currentUserId) {
      this.http.post(`/api/collaborative/pages/${this.currentPageId}/disconnect`, {
        userId: this.currentUserId
      }).subscribe();
    }

    this.currentPageId = null;
    this.currentUserId = null;
    this.currentUsername = null;
    this.presenceSubject.next([]);
  }
} 