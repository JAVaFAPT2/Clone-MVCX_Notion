import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentsService, Comment } from '../../services/comments.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="comments-container">
      <h4>Comments</h4>
      <div class="comments-list">
        <div 
          *ngFor="let comment of comments" 
          class="comment-item">
          <div class="comment-header">
            <span class="username">{{ comment.username }}</span>
            <span class="timestamp">{{ formatTimestamp(comment.timestamp) }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-replies" *ngIf="comment.replies && comment.replies.length > 0">
            <div 
              *ngFor="let reply of comment.replies" 
              class="reply-item">
              <div class="reply-header">
                <span class="username">{{ reply.username }}</span>
                <span class="timestamp">{{ formatTimestamp(reply.timestamp) }}</span>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="no-comments" *ngIf="comments.length === 0">
        <p>No comments yet</p>
      </div>
    </div>
  `,
  styles: [`
    .comments-container {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .comments-container h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .comment-item {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 12px;
      border: 1px solid #e9ecef;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
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

    .comment-content {
      font-size: 13px;
      line-height: 1.4;
      color: #333;
      margin-bottom: 8px;
    }

    .comment-replies {
      margin-top: 8px;
      padding-left: 16px;
      border-left: 2px solid #e9ecef;
    }

    .reply-item {
      margin-bottom: 8px;
      padding: 8px;
      background: white;
      border-radius: 4px;
    }

    .reply-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .reply-content {
      font-size: 12px;
      line-height: 1.4;
      color: #333;
    }

    .no-comments {
      text-align: center;
      color: #9b9a97;
      font-style: italic;
      padding: 20px;
    }

    .no-comments p {
      margin: 0;
      font-size: 13px;
    }
  `]
})
export class CommentsComponent implements OnInit, OnDestroy {
  @Input() pageId!: string;
  
  comments: Comment[] = [];
  private subscription: Subscription | null = null;

  constructor(private commentsService: CommentsService) {}

  ngOnInit(): void {
    if (this.pageId) {
      this.commentsService.initializeComments(this.pageId);
      
      this.subscription = this.commentsService.getComments().subscribe(comments => {
        this.comments = comments;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.commentsService.clearComments();
  }

  formatTimestamp(timestamp: string | undefined): string {
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
} 