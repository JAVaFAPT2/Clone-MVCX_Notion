import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// Yjs and TipTap imports
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Editor, JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';

// Presence and Comments imports
import { PresenceService } from '../../services/presence.service';
import { CommentsService } from '../../services/comments.service';
import { PresenceComponent } from '../presence/presence.component';
import { CommentsComponent } from '../comments/comments.component';

@Component({
  selector: 'app-collaborative-editor',
  standalone: true,
  imports: [CommonModule, PresenceComponent, CommentsComponent],
  template: `
    <div class="collaborative-editor-container">
      <div class="editor-header">
        <h3>Collaborative Editor</h3>
        <div class="editor-status">
          <span *ngIf="isSyncing" class="sync-indicator">Syncing...</span>
          <span *ngIf="!isSyncing" class="sync-indicator synced">Synced</span>
        </div>
      </div>

      <div class="editor-layout">
        <div class="editor-main">
          <div *ngIf="editor" class="editor-content">
            <div id="editor" [attr.data-page-id]="pageId"></div>
          </div>
          <div *ngIf="!editor" class="loading">Loading editor...</div>
        </div>

        <div class="editor-sidebar">
          <app-presence [pageId]="pageId" [showCursors]="true"></app-presence>
          <app-comments [pageId]="pageId"></app-comments>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .collaborative-editor-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
      border-radius: 8px 8px 0 0;
    }

    .editor-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .editor-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sync-indicator {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 12px;
      background: #ffc107;
      color: #333;
    }

    .sync-indicator.synced {
      background: #28a745;
      color: white;
    }

    .editor-layout {
      display: flex;
      flex: 1;
      min-height: 0;
    }

    .editor-main {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }

    .editor-content {
      height: 100%;
    }

    .editor-sidebar {
      width: 300px;
      border-left: 1px solid #e9ecef;
      background: #f8f9fa;
      overflow-y: auto;
      padding: 16px;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #666;
      font-style: italic;
    }

    /* TipTap Editor Styles */
    #editor {
      min-height: 400px;
      padding: 16px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
    }

    #editor:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    /* Collaboration cursor styles */
    .ProseMirror {
      position: relative;
    }

    .ProseMirror-focused {
      outline: none;
    }

    .ProseMirror p.is-editor-empty:first-child::before {
      color: #adb5bd;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
  `]
})
export class CollaborativeEditorComponent implements OnInit, OnDestroy {
  @Input() pageId!: string;
  @Input() convexDocId?: string;
  @Input() username: string = 'Anonymous';
  @Input() userId: string = 'anonymous';

  editor: Editor | null = null;
  ydoc!: Y.Doc;
  provider!: WebsocketProvider;
  isSyncing = false;
  syncInterval: any;

  constructor(
    private http: HttpClient,
    private presenceService: PresenceService,
    private commentsService: CommentsService
  ) {}

  ngOnInit(): void {
    if (!this.pageId) return;
    
    // Initialize presence and comments
    this.presenceService.initializePresence(this.pageId, this.userId, this.username);
    this.commentsService.initializeComments(this.pageId);
    
    // 1. Create Yjs document
    this.ydoc = new Y.Doc();
    
    // 2. Connect to y-websocket server (use convexDocId as room name if available)
    const room = this.convexDocId || `page-${this.pageId}`;
    this.provider = new WebsocketProvider('ws://localhost:1234', room, this.ydoc);

    // 3. Create TipTap editor with Yjs collaboration
    this.editor = new Editor({
      element: document.getElementById('editor') || undefined,
      extensions: [
        StarterKit,
        Collaboration.configure({ document: this.ydoc }),
        CollaborationCursor.configure({
          provider: this.provider,
          user: { name: this.username, color: '#007bff' }
        })
      ],
      content: '',
      autofocus: true,
      onUpdate: ({ editor }) => {
        // Sync to backend when content changes
        this.scheduleSyncToBackend();
        
        // Update presence with cursor position
        this.updateCursorPosition();
      },
      onSelectionUpdate: ({ editor }) => {
        // Update presence with selection
        this.updateSelectionPosition(editor);
      }
    });

    // 4. Periodically sync to backend
    this.syncInterval = setInterval(() => this.syncToBackend(), 5000);
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
    if (this.provider) {
      this.provider.destroy();
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // Clean up presence and comments
    this.presenceService.disconnect();
    this.commentsService.clearComments();
  }

  scheduleSyncToBackend() {
    this.isSyncing = true;
    setTimeout(() => {
      this.syncToBackend();
    }, 1000);
  }

  syncToBackend() {
    if (!this.pageId || !this.editor) return;
    
    const content = this.editor.getJSON();
    const blocks = this.tiptapJsonToBlocks(content);
    const payload = {
      title: this.extractTitle(content),
      blocks: blocks
    };
    
    this.http.post(`/api/collaborative/pages/${this.pageId}/sync-content`, payload).subscribe({
      next: () => { 
        this.isSyncing = false; 
      },
      error: () => { 
        this.isSyncing = false; 
      }
    });
  }

  updateCursorPosition() {
    if (!this.editor) return;
    
    const { from } = this.editor.state.selection;
    const coords = this.editor.view.coordsAtPos(from);
    
    this.presenceService.updateCursor({
      x: coords.left,
      y: coords.top
    });
  }

  updateSelectionPosition(editor: Editor) {
    const { from, to } = editor.state.selection;
    
    this.presenceService.updateSelection({
      from,
      to
    });
  }

  tiptapJsonToBlocks(json: JSONContent): any[] {
    if (!json.content) return [];
    return json.content.map(node => ({
      type: node.type,
      content: node.content && node.content[0] && node.content[0].text ? node.content[0].text : ''
    }));
  }

  extractTitle(json: JSONContent): string {
    if (!json.content) return '';
    for (const node of json.content) {
      if (node.type === 'heading' && node.content && node.content[0]?.text) {
        return node.content[0].text;
      }
      if (node.type === 'paragraph' && node.content && node.content[0]?.text) {
        return node.content[0].text;
      }
    }
    return '';
  }
} 