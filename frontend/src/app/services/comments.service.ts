import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Comment {
  id: string;
  pageId: string;
  userId: string;
  username: string;
  content: string;
  blockId?: string;
  parentCommentId?: string;
  mentions?: string[];
  resolved: boolean;
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
  replies?: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  blockId?: string;
}

export interface CreateReplyRequest {
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private currentPageId: string | null = null;
  private commentsSubject = new BehaviorSubject<Comment[]>([]);
  private commentCountSubject = new BehaviorSubject<number>(0);
  private unresolvedCommentsSubject = new BehaviorSubject<Comment[]>([]);

  constructor(private http: HttpClient) {}

  initializeComments(pageId: string): void {
    this.currentPageId = pageId;
    this.loadComments();
  }

  getComments(): Observable<Comment[]> {
    return this.commentsSubject.asObservable();
  }

  getCommentCount(): Observable<number> {
    return this.commentCountSubject.asObservable();
  }

  getUnresolvedComments(): Observable<Comment[]> {
    return this.unresolvedCommentsSubject.asObservable();
  }

  addComment(content: string, blockId?: string): Observable<Comment> {
    if (!this.currentPageId) {
      throw new Error('No page selected for comments');
    }

    return this.http.post<Comment>(`/api/comments/page/${this.currentPageId}`, {
      content,
      blockId
    });
  }

  addReply(parentCommentId: string, content: string): Observable<Comment> {
    return this.http.post<Comment>(`/api/comments/${parentCommentId}/replies`, {
      content
    });
  }

  resolveComment(commentId: string): Observable<Comment> {
    return this.http.put<Comment>(`/api/comments/${commentId}/resolve`, {});
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`/api/comments/${commentId}`);
  }

  getMentionsForUser(): Observable<Comment[]> {
    return this.http.get<Comment[]>('/api/comments/mentions');
  }

  getUnresolvedCommentsForPage(): Observable<Comment[]> {
    if (!this.currentPageId) {
      return new Observable(observer => observer.next([]));
    }

    return this.http.get<Comment[]>(`/api/comments/page/${this.currentPageId}/unresolved`);
  }

  getCommentCountForPage(): Observable<number> {
    if (!this.currentPageId) {
      return new Observable(observer => observer.next(0));
    }

    return this.http.get<{ count: number }>(`/api/comments/page/${this.currentPageId}/count`)
      .pipe(
        map(response => response.count)
      );
  }

  validateMentions(content: string): Observable<boolean> {
    return this.http.post<{ valid: boolean }>('/api/comments/validate-mentions', { content })
      .pipe(
        map(response => response.valid)
      );
  }

  formatContentWithMentions(content: string): string {
    // Replace @mentions with styled spans
    return content.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
  }

  clearComments(): void {
    this.currentPageId = null;
    this.commentsSubject.next([]);
    this.commentCountSubject.next(0);
    this.unresolvedCommentsSubject.next([]);
  }

  private loadComments(): void {
    if (!this.currentPageId) return;

    this.http.get<Comment[]>(`/api/comments/page/${this.currentPageId}`)
      .subscribe({
        next: (comments) => {
          this.commentsSubject.next(comments);
          this.updateCommentCount(comments);
          this.updateUnresolvedComments(comments);
        },
        error: (error) => {
          console.error('Error loading comments:', error);
        }
      });
  }

  private updateCommentCount(comments: Comment[]): void {
    const count = comments.length;
    this.commentCountSubject.next(count);
  }

  private updateUnresolvedComments(comments: Comment[]): void {
    const unresolved = comments.filter(comment => !comment.resolved);
    this.unresolvedCommentsSubject.next(unresolved);
  }
} 