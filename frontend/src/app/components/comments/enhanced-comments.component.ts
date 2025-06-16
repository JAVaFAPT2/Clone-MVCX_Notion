import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentsService, Comment } from '../../services/comments.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-enhanced-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="enhanced-comments-container">
      <div class="comments-header">
        <div class="header-left">
          <h4>Comments ({{ comments.length }})</h4>
          <div class="comment-stats" *ngIf="commentCount > 0">
            <span class="unresolved-count" *ngIf="unresolvedCount > 0">
              {{ unresolvedCount }} unresolved
            </span>
          </div>
        </div>
        <button 
          class="add-comment-btn" 
          (click)="showAddComment = !showAddComment"
          [class.active]="showAddComment">
          {{ showAddComment ? 'Cancel' : 'Add Comment' }}
        </button>
      </div>

      <!-- Add Comment Form -->
      <div class="add-comment-form" *ngIf="showAddComment">
        <div class="comment-input-container">
          <textarea 
            #commentInput
            [(ngModel)]="newCommentText" 
            placeholder="Write a comment... Use @username to mention someone"
            rows="3"
            class="comment-input"
            (input)="onCommentInput($event)"
            (keydown)="onKeyDown($event)">
          </textarea>
          <div class="mentions-suggestions" *ngIf="showMentionsSuggestions">
            <div 
              *ngFor="let user of filteredUsers; let i = index"
              class="mention-suggestion"
              [class.selected]="i === selectedMentionIndex"
              (click)="selectMention(user)">
              &#64;{{ user }}
            </div>
          </div>
        </div>
        <div class="comment-actions">
          <button 
            (click)="addComment()" 
            [disabled]="!newCommentText.trim()"
            class="submit-btn">
            Add Comment
          </button>
          <button 
            (click)="showAddComment = false" 
            class="cancel-btn">
            Cancel
          </button>
        </div>
      </div>

      <!-- Comments List -->
      <div class="comments-list">
        <div 
          *ngFor="let comment of comments" 
          class="comment-item"
          [class.resolved]="comment.resolved">
          
          <div class="comment-header">
            <div class="comment-author">
              <span class="username">{{ comment.username }}</span>
              <span class="timestamp">{{ formatTimestamp(comment.timestamp || comment.createdAt || '') }}</span>
              <span class="mention-badge" *ngIf="comment.mentions && comment.mentions.length > 0">
                {{ comment.mentions.length }} mention{{ comment.mentions.length > 1 ? 's' : '' }}
              </span>
            </div>
            <div class="comment-actions">
              <button 
                *ngIf="!comment.resolved"
                (click)="resolveComment(comment.id)" 
                class="resolve-btn">
                Resolve
              </button>
              <button 
                (click)="deleteComment(comment.id)" 
                class="delete-btn">
                Delete
              </button>
            </div>
          </div>

          <div class="comment-content" [innerHTML]="formatContentWithMentions(comment.content)">
          </div>

          <div class="comment-replies" *ngIf="comment.replies && comment.replies.length > 0">
            <div 
              *ngFor="let reply of comment.replies" 
              class="reply-item">
              <div class="reply-header">
                <span class="username">{{ reply.username }}</span>
                <span class="timestamp">{{ formatTimestamp(reply.timestamp || reply.createdAt || '') }}</span>
              </div>
              <div class="reply-content" [innerHTML]="formatContentWithMentions(reply.content)"></div>
            </div>
          </div>

          <!-- Add Reply Form -->
          <div class="add-reply-form" *ngIf="replyingTo === comment.id">
            <div class="reply-input-container">
              <textarea 
                #replyInput
                [(ngModel)]="newReplyText" 
                placeholder="Write a reply... Use @username to mention someone"
                rows="2"
                class="reply-input"
                (input)="onReplyInput($event)"
                (keydown)="onReplyKeyDown($event)">
              </textarea>
              <div class="mentions-suggestions" *ngIf="showReplyMentionsSuggestions">
                <div 
                  *ngFor="let user of filteredUsers; let i = index"
                  class="mention-suggestion"
                  [class.selected]="i === selectedMentionIndex"
                  (click)="selectReplyMention(user)">
                  &#64;{{ user }}
                </div>
              </div>
            </div>
            <div class="reply-actions">
              <button 
                (click)="addReply(comment.id)" 
                [disabled]="!newReplyText.trim()"
                class="submit-btn">
                Reply
              </button>
              <button 
                (click)="cancelReply()" 
                class="cancel-btn">
                Cancel
              </button>
            </div>
          </div>

          <button 
            *ngIf="!comment.resolved"
            (click)="startReply(comment.id)" 
            class="reply-btn">
            Reply
          </button>
        </div>
      </div>

      <div class="no-comments" *ngIf="comments.length === 0">
        <p>No comments yet. Be the first to add one!</p>
      </div>
    </div>
  `,
  styles: [`
    .enhanced-comments-container {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .comments-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .comments-header h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .comment-stats {
      display: flex;
      gap: 8px;
    }

    .unresolved-count {
      background: #ffc107;
      color: #333;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
    }

    .add-comment-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .add-comment-btn.active {
      background: #6c757d;
    }

    .add-comment-form, .add-reply-form {
      margin-bottom: 16px;
      padding: 12px;
      background: white;
      border-radius: 6px;
      border: 1px solid #ddd;
    }

    .comment-input-container, .reply-input-container {
      position: relative;
    }

    .comment-input, .reply-input {
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 8px;
      font-size: 13px;
      resize: vertical;
    }

    .mentions-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      max-height: 150px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .mention-suggestion {
      padding: 8px 12px;
      cursor: pointer;
      font-size: 13px;
    }

    .mention-suggestion:hover,
    .mention-suggestion.selected {
      background: #f0f0f0;
    }

    .comment-actions, .reply-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .submit-btn, .resolve-btn, .reply-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 11px;
    }

    .submit-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .delete-btn, .cancel-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 11px;
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .comment-item {
      background: white;
      border-radius: 6px;
      padding: 12px;
      border: 1px solid #ddd;
    }

    .comment-item.resolved {
      opacity: 0.7;
      background: #f8f9fa;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .comment-author {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .username {
      font-weight: 600;
      font-size: 13px;
      color: #333;
    }

    .timestamp {
      font-size: 11px;
      color: #666;
    }

    .mention-badge {
      background: #007bff;
      color: white;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
    }

    .comment-content, .reply-content {
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 8px;
    }

    .mention {
      background: #e3f2fd;
      color: #1976d2;
      padding: 1px 3px;
      border-radius: 3px;
      font-weight: 500;
    }

    .comment-replies {
      margin-top: 8px;
      padding-left: 16px;
      border-left: 2px solid #e0e0e0;
    }

    .reply-item {
      margin-bottom: 8px;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .reply-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .no-comments {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 20px;
    }
  `]
})
export class EnhancedCommentsComponent implements OnInit, OnDestroy {
  @Input() pageId!: string;
  @ViewChild('commentInput') commentInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('replyInput') replyInput!: ElementRef<HTMLTextAreaElement>;

  comments: Comment[] = [];
  showAddComment = false;
  newCommentText = '';
  newReplyText = '';
  replyingTo: string | null = null;
  commentCount = 0;
  unresolvedCount = 0;
  
  // Mentions functionality
  showMentionsSuggestions = false;
  showReplyMentionsSuggestions = false;
  selectedMentionIndex = 0;
  filteredUsers: string[] = [];
  allUsers: string[] = ['john_doe', 'jane_smith', 'admin', 'user1', 'user2']; // This should come from a service
  
  private subscription: Subscription | null = null;

  constructor(private commentsService: CommentsService) {}

  ngOnInit(): void {
    if (this.pageId) {
      this.commentsService.initializeComments(this.pageId);
      
      this.subscription = this.commentsService.getComments().subscribe(comments => {
        this.comments = comments;
      });

      // Load comment count
      this.commentsService.getCommentCount().subscribe(count => {
        this.commentCount = count;
      });

      // Load unresolved count
      this.commentsService.getUnresolvedComments().subscribe(comments => {
        this.unresolvedCount = comments.length;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.commentsService.clearComments();
  }

  addComment(): void {
    if (!this.newCommentText.trim()) return;

    this.commentsService.addComment(this.newCommentText.trim()).subscribe({
      next: () => {
        this.newCommentText = '';
        this.showAddComment = false;
        this.showMentionsSuggestions = false;
      },
      error: (error) => {
        console.error('Failed to add comment:', error);
      }
    });
  }

  addReply(parentCommentId: string): void {
    if (!this.newReplyText.trim()) return;

    this.commentsService.addReply(parentCommentId, this.newReplyText.trim()).subscribe({
      next: () => {
        this.newReplyText = '';
        this.replyingTo = null;
        this.showReplyMentionsSuggestions = false;
      },
      error: (error) => {
        console.error('Failed to add reply:', error);
      }
    });
  }

  resolveComment(commentId: string): void {
    this.commentsService.resolveComment(commentId).subscribe({
      error: (error) => {
        console.error('Failed to resolve comment:', error);
      }
    });
  }

  deleteComment(commentId: string): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentsService.deleteComment(commentId).subscribe({
        error: (error) => {
          console.error('Failed to delete comment:', error);
        }
      });
    }
  }

  startReply(commentId: string): void {
    this.replyingTo = commentId;
    setTimeout(() => {
      this.replyInput.nativeElement.focus();
    }, 100);
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.newReplyText = '';
    this.showReplyMentionsSuggestions = false;
  }

  formatTimestamp(timestamp: string): string {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  formatContentWithMentions(content: string): string {
    return this.commentsService.formatContentWithMentions(content);
  }

  // Mentions functionality
  onCommentInput(event: any): void {
    const value = event.target.value;
    const cursorPosition = event.target.selectionStart;
    const beforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const searchTerm = mentionMatch[1].toLowerCase();
      this.filteredUsers = this.allUsers.filter(user => 
        user.toLowerCase().includes(searchTerm)
      );
      this.showMentionsSuggestions = this.filteredUsers.length > 0;
      this.selectedMentionIndex = 0;
    } else {
      this.showMentionsSuggestions = false;
    }
  }

  onReplyInput(event: any): void {
    const value = event.target.value;
    const cursorPosition = event.target.selectionStart;
    const beforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const searchTerm = mentionMatch[1].toLowerCase();
      this.filteredUsers = this.allUsers.filter(user => 
        user.toLowerCase().includes(searchTerm)
      );
      this.showReplyMentionsSuggestions = this.filteredUsers.length > 0;
      this.selectedMentionIndex = 0;
    } else {
      this.showReplyMentionsSuggestions = false;
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.showMentionsSuggestions) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.selectedMentionIndex = Math.min(this.selectedMentionIndex + 1, this.filteredUsers.length - 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.selectedMentionIndex = Math.max(this.selectedMentionIndex - 1, 0);
      } else if (event.key === 'Enter' && this.filteredUsers.length > 0) {
        event.preventDefault();
        this.selectMention(this.filteredUsers[this.selectedMentionIndex]);
      } else if (event.key === 'Escape') {
        this.showMentionsSuggestions = false;
      }
    }
  }

  onReplyKeyDown(event: KeyboardEvent): void {
    if (this.showReplyMentionsSuggestions) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.selectedMentionIndex = Math.min(this.selectedMentionIndex + 1, this.filteredUsers.length - 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.selectedMentionIndex = Math.max(this.selectedMentionIndex - 1, 0);
      } else if (event.key === 'Enter' && this.filteredUsers.length > 0) {
        event.preventDefault();
        this.selectReplyMention(this.filteredUsers[this.selectedMentionIndex]);
      } else if (event.key === 'Escape') {
        this.showReplyMentionsSuggestions = false;
      }
    }
  }

  selectMention(username: string): void {
    const textarea = this.commentInput.nativeElement;
    const value = textarea.value;
    const cursorPosition = textarea.selectionStart;
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      const startPos = cursorPosition - mentionMatch[0].length;
      const newValue = value.substring(0, startPos) + '@' + username + ' ' + afterCursor;
      this.newCommentText = newValue;
      
      setTimeout(() => {
        const newCursorPos = startPos + username.length + 2; // +2 for @ and space
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
    
    this.showMentionsSuggestions = false;
  }

  selectReplyMention(username: string): void {
    const textarea = this.replyInput.nativeElement;
    const value = textarea.value;
    const cursorPosition = textarea.selectionStart;
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      const startPos = cursorPosition - mentionMatch[0].length;
      const newValue = value.substring(0, startPos) + '@' + username + ' ' + afterCursor;
      this.newReplyText = newValue;
      
      setTimeout(() => {
        const newCursorPos = startPos + username.length + 2; // +2 for @ and space
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
    
    this.showReplyMentionsSuggestions = false;
  }
} 