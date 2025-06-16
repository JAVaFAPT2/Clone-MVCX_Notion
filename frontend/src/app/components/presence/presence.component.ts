import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresenceService, UserPresence } from '../../services/presence.service';
import { Subscription } from 'rxjs';

interface ExtendedUserPresence extends UserPresence {
  color: string;
  isOnline: boolean;
}

@Component({
  selector: 'app-presence',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="presence-container">
      <h4>Active Users</h4>
      <div class="users-list">
        <div 
          *ngFor="let user of onlineUsers" 
          class="user-item"
          [style.border-left-color]="user.color">
          <div class="user-info">
            <span class="username">{{ user.username }}</span>
            <div class="status-indicator" [class.online]="user.isOnline"></div>
          </div>
          <div class="user-cursor" 
               *ngIf="user.cursor"
               [style.left.px]="user.cursor.x"
               [style.top.px]="user.cursor.y"
               [style.background-color]="user.color"
               [style.display]="user.cursor && user.isOnline ? 'block' : 'none'">
            </div>
        </div>
      </div>
      <div class="no-users" *ngIf="onlineUsers.length === 0">
        <p>No other users online</p>
      </div>
    </div>
  `,
  styles: [`
    .presence-container {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .presence-container h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .users-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .user-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 3px solid #007bff;
      position: relative;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .username {
      font-size: 13px;
      font-weight: 500;
      color: #333;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #9b9a97;
    }

    .status-indicator.online {
      background: #28a745;
    }

    .user-cursor {
      position: absolute;
      width: 2px;
      height: 20px;
      border-radius: 1px;
      pointer-events: none;
      z-index: 1000;
    }

    .no-users {
      text-align: center;
      color: #9b9a97;
      font-style: italic;
      padding: 16px;
    }

    .no-users p {
      margin: 0;
      font-size: 13px;
    }
  `]
})
export class PresenceComponent implements OnInit, OnDestroy {
  @Input() pageId!: string;
  @Input() showCursors: boolean = true;

  onlineUsers: ExtendedUserPresence[] = [];
  private subscription: Subscription | null = null;

  constructor(private presenceService: PresenceService) {}

  ngOnInit(): void {
    if (this.pageId) {
      this.subscription = this.presenceService.getPresence().subscribe(presence => {
        // Convert UserPresence to ExtendedUserPresence with default values
        this.onlineUsers = presence.map(user => ({
          ...user,
          color: this.generateUserColor(user.userId),
          isOnline: this.isUserOnline(user.lastSeen)
        }));
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private generateUserColor(userId: string): string {
    // Generate a consistent color based on user ID
    const colors = [
      '#007bff', '#28a745', '#ffc107', '#dc3545', 
      '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  private isUserOnline(lastSeen: Date): boolean {
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
    return diffMinutes < 5; // Consider online if seen within 5 minutes
  }
} 