import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageShareService, PageShare, Permission } from '../../services/page-share.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-page-share',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-share-container">
      <div class="share-header">
        <h4>Share Page</h4>
        <button 
          class="share-btn" 
          (click)="showShareModal = !showShareModal"
          [class.active]="showShareModal">
          {{ showShareModal ? 'Cancel' : 'Share' }}
        </button>
      </div>

      <!-- Share Modal -->
      <div class="share-modal" *ngIf="showShareModal">
        <div class="modal-content">
          <div class="modal-header">
            <h5>Share this page</h5>
            <button class="close-btn" (click)="showShareModal = false">&times;</button>
          </div>

          <!-- Share with User -->
          <div class="share-section">
            <h6>Share with people</h6>
            <div class="share-input-group">
              <input 
                type="text" 
                [(ngModel)]="userEmail" 
                placeholder="Enter email address"
                class="share-input"
                (keydown)="onUserInputKeyDown($event)">
              <select [(ngModel)]="selectedPermission" class="permission-select">
                <option *ngFor="let perm of availablePermissions" [value]="perm.value">
                  {{ perm.description }}
                </option>
              </select>
              <button 
                (click)="shareWithUser()" 
                [disabled]="!userEmail.trim()"
                class="share-action-btn">
                Share
              </button>
            </div>
          </div>

          <!-- Public Share -->
          <div class="share-section">
            <h6>Create a public link</h6>
            <div class="public-share-group">
              <select [(ngModel)]="publicPermission" class="permission-select">
                <option *ngFor="let perm of availablePermissions" [value]="perm.value">
                  {{ perm.description }}
                </option>
              </select>
              <div class="expiration-group">
                <label>
                  <input type="checkbox" [(ngModel)]="setExpiration">
                  Set expiration date
                </label>
                <input 
                  *ngIf="setExpiration"
                  type="datetime-local" 
                  [(ngModel)]="expirationDate"
                  class="expiration-input">
              </div>
              <button 
                (click)="createPublicShare()" 
                class="share-action-btn">
                Create Link
              </button>
            </div>
          </div>

          <!-- Current Shares -->
          <div class="current-shares" *ngIf="shares.length > 0">
            <h6>People with access</h6>
            <div class="shares-list">
              <div 
                *ngFor="let share of shares" 
                class="share-item"
                [class.expired]="isExpired(share.expiresAt)">
                
                <div class="share-info">
                  <div class="share-user">
                    <span class="user-email">{{ share.sharedWithUserId || 'Public Link' }}</span>
                    <span class="share-type" *ngIf="share.isPublic">(Public)</span>
                  </div>
                  <div class="share-details">
                    <span class="permission-badge">{{ getPermissionDescription(share.permission) }}</span>
                    <span class="share-date">Shared {{ formatShareDate(share.createdAt) }}</span>
                    <span class="expiration-info" *ngIf="share.expiresAt">
                      {{ formatExpirationDate(share.expiresAt) }}
                    </span>
                  </div>
                </div>

                <div class="share-actions">
                  <select 
                    *ngIf="!share.isPublic"
                    [(ngModel)]="share.permission" 
                    (change)="updatePermission(share)"
                    class="permission-select-small">
                    <option *ngFor="let perm of availablePermissions" [value]="perm.value">
                      {{ perm.description }}
                    </option>
                  </select>
                  <button 
                    (click)="revokeShare(share)" 
                    class="revoke-btn">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Public Links -->
          <div class="public-links" *ngIf="publicShares.length > 0">
            <h6>Public links</h6>
            <div class="links-list">
              <div 
                *ngFor="let share of publicShares" 
                class="link-item"
                [class.expired]="isExpired(share.expiresAt)">
                
                <div class="link-info">
                  <div class="link-url">
                    <input 
                      [value]="getShareUrl(share.shareLink!)" 
                      readonly
                      class="url-input">
                    <button 
                      (click)="copyToClipboard(getShareUrl(share.shareLink!))"
                      class="copy-btn">
                      Copy
                    </button>
                  </div>
                  <div class="link-details">
                    <span class="permission-badge">{{ getPermissionDescription(share.permission) }}</span>
                    <span class="expiration-info" *ngIf="share.expiresAt">
                      {{ formatExpirationDate(share.expiresAt) }}
                    </span>
                  </div>
                </div>

                <button 
                  (click)="revokePublicShare(share)" 
                  class="revoke-btn">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Share Summary -->
      <div class="share-summary" *ngIf="!showShareModal && shares.length > 0">
        <div class="summary-stats">
          <span class="stat-item">
            <i class="icon-users"></i>
            {{ userShares.length }} people
          </span>
          <span class="stat-item" *ngIf="publicShares.length > 0">
            <i class="icon-link"></i>
            {{ publicShares.length }} public link{{ publicShares.length > 1 ? 's' : '' }}
          </span>
        </div>
        <button class="manage-btn" (click)="showShareModal = true">
          Manage
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page-share-container {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .share-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .share-header h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .share-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .share-btn.active {
      background: #6c757d;
    }

    .share-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h5 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }

    .share-section {
      margin-bottom: 24px;
    }

    .share-section h6 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .share-input-group {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .share-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .permission-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      min-width: 150px;
    }

    .share-action-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .share-action-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .public-share-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .expiration-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .expiration-group label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
    }

    .expiration-input {
      padding: 6px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .current-shares, .public-links {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .shares-list, .links-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .share-item, .link-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }

    .share-item.expired, .link-item.expired {
      opacity: 0.6;
      background: #f8f9fa;
    }

    .share-info, .link-info {
      flex: 1;
    }

    .share-user, .link-url {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .user-email {
      font-weight: 500;
      font-size: 14px;
    }

    .share-type {
      font-size: 12px;
      color: #666;
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 10px;
    }

    .share-details, .link-details {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #666;
    }

    .permission-badge {
      background: #007bff;
      color: white;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 11px;
    }

    .share-date, .expiration-info {
      font-size: 11px;
      color: #666;
    }

    .share-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .permission-select-small {
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: 12px;
    }

    .revoke-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    }

    .url-input {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 12px;
      background: white;
    }

    .copy-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .share-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: white;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }

    .summary-stats {
      display: flex;
      gap: 16px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #666;
    }

    .manage-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    }

    .icon-users::before {
      content: "👥";
    }

    .icon-link::before {
      content: "🔗";
    }
  `]
})
export class PageShareComponent implements OnInit, OnDestroy {
  @Input() pageId!: string;

  shares: PageShare[] = [];
  availablePermissions: Permission[] = [];
  showShareModal = false;
  userEmail = '';
  selectedPermission = 'VIEW';
  publicPermission = 'VIEW';
  setExpiration = false;
  expirationDate = '';

  private subscription: Subscription | null = null;

  constructor(private pageShareService: PageShareService) {}

  ngOnInit(): void {
    if (this.pageId) {
      this.pageShareService.initializeShares(this.pageId);
      
      this.subscription = this.pageShareService.getSharesForPage().subscribe(shares => {
        this.shares = shares;
      });

      this.pageShareService.getAvailablePermissions().subscribe(response => {
        this.availablePermissions = response.permissions;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.pageShareService.clearShares();
  }

  get userShares(): PageShare[] {
    return this.shares.filter(share => !share.isPublic);
  }

  get publicShares(): PageShare[] {
    return this.shares.filter(share => share.isPublic);
  }

  shareWithUser(): void {
    if (!this.userEmail.trim()) return;

    this.pageShareService.sharePageWithUser(this.userEmail, this.selectedPermission).subscribe({
      next: () => {
        this.userEmail = '';
        this.selectedPermission = 'VIEW';
      },
      error: (error) => {
        console.error('Failed to share page:', error);
      }
    });
  }

  createPublicShare(): void {
    let expiresAt: string | undefined;
    if (this.setExpiration && this.expirationDate) {
      expiresAt = new Date(this.expirationDate).toISOString();
    }

    this.pageShareService.createPublicShare(this.publicPermission, expiresAt).subscribe({
      next: () => {
        this.publicPermission = 'VIEW';
        this.setExpiration = false;
        this.expirationDate = '';
      },
      error: (error) => {
        console.error('Failed to create public share:', error);
      }
    });
  }

  updatePermission(share: PageShare): void {
    this.pageShareService.updateSharePermission(share.sharedWithUserId!, share.permission).subscribe({
      error: (error) => {
        console.error('Failed to update permission:', error);
      }
    });
  }

  revokeShare(share: PageShare): void {
    if (share.isPublic) {
      this.pageShareService.revokePublicShare().subscribe({
        error: (error) => {
          console.error('Failed to revoke public share:', error);
        }
      });
    } else {
      this.pageShareService.revokeShare(share.sharedWithUserId!).subscribe({
        error: (error) => {
          console.error('Failed to revoke share:', error);
        }
      });
    }
  }

  revokePublicShare(share: PageShare): void {
    this.pageShareService.revokePublicShare().subscribe({
      error: (error) => {
        console.error('Failed to revoke public share:', error);
      }
    });
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard:', text);
    });
  }

  onUserInputKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.shareWithUser();
    }
  }

  getPermissionDescription(permission: string): string {
    return this.pageShareService.getPermissionDescription(permission);
  }

  formatShareDate(date: string): string {
    const shareDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - shareDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return shareDate.toLocaleDateString();
    }
  }

  formatExpirationDate(expiresAt: string): string {
    return this.pageShareService.formatExpirationDate(expiresAt);
  }

  isExpired(expiresAt?: string): boolean {
    return this.pageShareService.isExpired(expiresAt);
  }

  getShareUrl(shareLink: string): string {
    return this.pageShareService.getShareUrl(shareLink);
  }
} 