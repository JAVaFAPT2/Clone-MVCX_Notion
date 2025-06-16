import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { PageService } from '../../services/page.service';
import { AuthService } from '../../services/auth.service';
import { PageSelectionService } from '../../services/page-selection.service';
import { BlockConverterService } from '../../services/block-converter.service';
import { Subscription } from 'rxjs';
import { Page } from '../../models/page.model';
import { Block, BlockType, createBlock } from '../../models/block.model';
import { CollaborativeEditorComponent } from '../collaborative-editor/collaborative-editor.component';
import { EnhancedCommentsComponent } from '../comments/enhanced-comments.component';
import { BlockEditorComponent } from '../block-editor/block-editor.component';

@Component({
  selector: 'app-page-editor',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CollaborativeEditorComponent,
    EnhancedCommentsComponent,
    BlockEditorComponent
  ],
  template: `
    <div class="page-editor-container">
      <!-- Header -->
      <header class="editor-header">
        <div class="header-left">
          <button class="back-btn" (click)="goBack()">
            <span class="icon">←</span>
            Back to Workspace
          </button>
        </div>
        <div class="header-center">
          <div class="page-icon-input">
            <input 
              type="text" 
              [(ngModel)]="pageIcon" 
              placeholder="📄" 
              maxlength="2"
              class="icon-input"
            >
          </div>
          <input 
            type="text" 
            [(ngModel)]="pageTitle" 
            placeholder="Untitled" 
            class="title-input"
          >
        </div>
        <div class="header-right">
          <div class="editor-mode-toggle">
            <button 
              class="mode-btn" 
              [class.active]="editorMode === 'basic'"
              (click)="setEditorMode('basic')">
              Basic
            </button>
            <button 
              class="mode-btn" 
              [class.active]="editorMode === 'collaborative'"
              (click)="setEditorMode('collaborative')">
              Collaborative
            </button>
          </div>
          <button class="save-btn" (click)="savePage()" [disabled]="saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </header>

      <!-- Error Message -->
      <div *ngIf="error" class="editor-error">
        <div class="error-card">
          <h3>Error</h3>
          <p>{{ error }}</p>
          <button class="retry-btn" (click)="retryLoadPage()">Retry</button>
        </div>
      </div>

      <!-- Editor Content -->
      <main class="editor-content" *ngIf="!error">
        <!-- Collaborative Editor Mode -->
        <div *ngIf="editorMode === 'collaborative'" class="collaborative-mode">
          <app-collaborative-editor
            [pageId]="pageId || 'new'"
            [username]="currentUser?.username || 'Anonymous'"
            [userId]="currentUser?.id || 'anonymous'"
            [convexDocId]="convexDocId">
          </app-collaborative-editor>
        </div>

        <!-- Basic Editor Mode -->
        <div *ngIf="editorMode === 'basic'" class="basic-mode">
          <app-block-editor
            [initialBlocks]="editorBlocks"
            [pageId]="pageId"
            (blocksChange)="onBlocksChange($event)"
            (contentChange)="onContentChange($event)">
          </app-block-editor>
        </div>

        <!-- Comments Section -->
        <div class="comments-section" *ngIf="pageId && pageId !== 'new'">
          <app-enhanced-comments [pageId]="pageId"></app-enhanced-comments>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./page-editor.component.scss']
})
export class PageEditorComponent implements OnInit, OnDestroy {
  @ViewChild(BlockEditorComponent) blockEditor!: BlockEditorComponent;
  
  pageId: string | null = null;
  pageTitle: string = 'Untitled';
  pageIcon: string = '📄';
  pageBlocks: Block[] = [];
  editorBlocks: Block[] = [];
  saving: boolean = false;
  editorMode: 'basic' | 'collaborative' = 'basic';
  convexDocId: string | undefined = undefined;
  currentUser: any = null;
  hasUnsavedChanges: boolean = false;

  error: string | null = null;

  private pageSelectionSub: Subscription | undefined;
  private autoSaveTimer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pageService: PageService,
    private authService: AuthService,
    private elRef: ElementRef,
    private pageSelectionService: PageSelectionService,
    private blockConverter: BlockConverterService
  ) {}

  ngOnInit() {
    this.loadUserData();
    
    this.route.params.subscribe(params => {
      this.pageId = params['id'] || null;
      this.updateUrl();
    });

    if (this.pageId && this.pageId !== 'new') {
      this.loadPage();
    } else {
      // Create new page with default block
      this.pageBlocks = [createBlock('paragraph', '')];
      this.editorBlocks = [...this.pageBlocks]; // Use the same blocks directly
    }
    
    // Add keyboard shortcut for saving (Ctrl+S)
    document.addEventListener('keydown', this.handleKeydown.bind(this));

    this.pageSelectionSub = this.pageSelectionService.getSelectedPage().subscribe(selectedPage => {
      if (selectedPage && selectedPage.id) {
        this.loadPageById(selectedPage.id);
      } else {
        this.clearEditor();
      }
    });
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    if (this.pageSelectionSub) {
      this.pageSelectionSub.unsubscribe();
    }
  }

  loadUserData() {
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser = {
          id: payload.id,
          username: payload.sub,
          email: payload.email
        };
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }

  setEditorMode(mode: 'basic' | 'collaborative') {
    this.editorMode = mode;
    if (mode === 'collaborative' && this.pageId && this.pageId !== 'new') {
      // Initialize collaborative mode
      this.initializeCollaborativeMode();
    }
  }

  initializeCollaborativeMode() {
    // Generate a convex doc ID if not exists
    if (!this.convexDocId && this.pageId) {
      this.convexDocId = `doc_${this.pageId}_${Date.now()}`;
    }
  }

  handleKeydown(event: KeyboardEvent) {
    // Save on Ctrl+S (or Cmd+S on Mac)
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.savePage();
    }
  }

  loadPage() {
    if (!this.pageId) return;
    this.error = null;
    this.pageService.getPage(this.pageId).subscribe({
      next: (page: Page) => {
        this.pageTitle = page.title || 'Untitled';
        this.pageIcon = page.icon || '📄';
        this.pageBlocks = page.blocks || [createBlock('paragraph', '')];
        this.editorBlocks = [...this.pageBlocks];
        this.convexDocId = page.convexDocId || undefined;
        this.hasUnsavedChanges = false;
        this.error = null;
      },
      error: (error) => {
        console.error('Error loading page:', error);
        if (error.status === 404) {
          this.pageId = null;
          this.pageBlocks = [createBlock('paragraph', '')];
          this.editorBlocks = [...this.pageBlocks];
          this.error = 'Page not found.';
        } else if (error.status === 401) {
          this.error = 'Authentication failed. Please log in again.';
          this.router.navigate(['/login']);
        } else if (error.status === 0) {
          this.error = 'Network error. Please check your connection.';
        } else {
          this.error = 'Failed to load page. Please try again.';
        }
      }
    });
  }

  retryLoadPage() {
    this.error = null;
    this.loadPage();
  }

  savePage(showMessage: boolean = true) {
    if (this.saving) return;
    
    this.saving = true;
    this.error = null;

    const pageData: Page = {
      title: this.pageTitle,
      icon: this.pageIcon,
      blocks: this.pageBlocks
    };

    if (this.pageId && this.pageId !== 'new') {
      // Update existing page
      this.pageService.updatePage(this.pageId, pageData).subscribe({
        next: (updatedPage) => {
          this.saving = false;
          this.hasUnsavedChanges = false;
          if (showMessage) {
            console.log('Page saved successfully');
          }
        },
        error: (error) => {
          this.saving = false;
          this.error = 'Failed to save page: ' + error.message;
          console.error('Error saving page:', error);
        }
      });
    } else {
      // Create new page
      this.pageService.createPage(pageData).subscribe({
        next: (newPage) => {
          this.pageId = newPage.id || null;
          this.saving = false;
          this.hasUnsavedChanges = false;
          this.updateUrl();
          if (showMessage) {
            console.log('Page created successfully');
          }
        },
        error: (error) => {
          this.saving = false;
          this.error = 'Failed to create page: ' + error.message;
          console.error('Error creating page:', error);
        }
      });
    }
  }

  updateUrl() {
    if (this.pageId) {
      this.router.navigate(['/workspace/page', this.pageId], { replaceUrl: true });
    }
  }

  addBlock(type: BlockType) {
    this.pageBlocks.push(createBlock(type, ''));
  }

  deleteBlock(index: number) {
    this.pageBlocks.splice(index, 1);
    if (this.pageBlocks.length === 0) {
      this.pageBlocks.push(createBlock('paragraph', ''));
    }
  }

  getPlaceholder(type: string): string {
    switch (type) {
      case 'h1': return 'Heading 1';
      case 'h2': return 'Heading 2';
      case 'h3': return 'Heading 3';
      case 'p': return 'Type "/" for commands';
      case 'todo': return 'To-do item';
      case 'bulleted': return 'Bulleted list';
      case 'numbered': return 'Numbered list';
      case 'quote': return 'Quote';
      default: return 'Type "/" for commands';
    }
  }

  goBack() {
    this.router.navigate(['/workspace']);
  }

  loadPageById(id: string) {
    this.pageService.getPage(id).subscribe({
      next: (page) => {
        this.pageId = page.id || id;
        this.pageTitle = page.title || 'Untitled';
        this.pageIcon = page.icon || '📄';
        this.pageBlocks = page.blocks || [createBlock('paragraph', '')];
        this.editorBlocks = [...this.pageBlocks];
        this.convexDocId = page.convexDocId || undefined;
        this.hasUnsavedChanges = false;
        this.error = null;
      },
      error: (err) => {
        this.error = 'Failed to load page.';
      }
    });
  }

  clearEditor() {
    this.pageId = null;
    this.pageTitle = 'Untitled';
    this.pageIcon = '📄';
    this.pageBlocks = [createBlock('paragraph', '')];
    this.editorBlocks = [...this.pageBlocks];
    this.convexDocId = undefined;
    this.hasUnsavedChanges = false;
    this.error = null;
  }

  onBlocksChange(blocks: Block[]) {
    this.editorBlocks = blocks;
    this.pageBlocks = [...blocks];
    this.hasUnsavedChanges = true;
    this.scheduleAutoSave();
  }

  onContentChange(content: string) {
    // Handle content change
    this.hasUnsavedChanges = true;
    this.scheduleAutoSave();
  }

  scheduleAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    this.autoSaveTimer = setTimeout(() => {
      this.autoSave();
    }, 3000); // Auto-save after 3 seconds of inactivity
  }

  autoSave() {
    if (this.hasUnsavedChanges && this.pageId && this.pageId !== 'new') {
      this.savePage(false); // Silent save
    }
  }
} 