import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollaborativeEditorComponent } from '../collaborative-editor/collaborative-editor.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-collaborative-example',
  standalone: true,
  imports: [CommonModule, CollaborativeEditorComponent],
  template: `
    <div class="example-container">
      <div class="example-header">
        <h2>Collaborative Editor with Presence & Comments</h2>
        <p>This example demonstrates real-time collaborative editing with user presence and comments.</p>
      </div>

      <div class="example-content">
        <app-collaborative-editor
          [pageId]="pageId"
          [convexDocId]="convexDocId"
          [username]="currentUsername"
          [userId]="currentUserId">
        </app-collaborative-editor>
      </div>

      <div class="example-instructions">
        <h3>How to Test:</h3>
        <ol>
          <li>Open this page in multiple browser tabs/windows</li>
          <li>Start typing in the editor - you'll see real-time collaboration</li>
          <li>Watch the presence sidebar to see other users</li>
          <li>Add comments using the comments panel</li>
          <li>See cursor positions of other users in real-time</li>
        </ol>

        <h3>Features Included:</h3>
        <ul>
          <li>✅ Real-time collaborative editing with Yjs + TipTap</li>
          <li>✅ User presence tracking</li>
          <li>✅ Live cursor positions</li>
          <li>✅ Comments and replies</li>
          <li>✅ Automatic sync to backend</li>
          <li>✅ Conflict resolution</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .example-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .example-header h2 {
      color: #333;
      margin-bottom: 10px;
    }

    .example-header p {
      color: #666;
      font-size: 16px;
    }

    .example-content {
      margin-bottom: 30px;
      height: 600px;
    }

    .example-instructions {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .example-instructions h3 {
      color: #333;
      margin-bottom: 15px;
    }

    .example-instructions ol,
    .example-instructions ul {
      margin-bottom: 20px;
    }

    .example-instructions li {
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .example-instructions ul li {
      list-style-type: none;
    }

    .example-instructions ul li:before {
      content: "✅ ";
      margin-right: 8px;
    }
  `]
})
export class CollaborativeExampleComponent implements OnInit {
  pageId = 'example-page-123';
  convexDocId = 'doc_example_page_123_1234567890';
  currentUsername = 'Demo User';
  currentUserId = 'demo-user-123';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Get current user info from auth service
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUsername = currentUser.username || 'Demo User';
      this.currentUserId = currentUser.id || 'demo-user-123';
    }
  }
} 