import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Page, PageService } from '../../services/page.service';
import { PageLinkParserService } from '../../services/page-link-parser.service';
import { PageLinksComponent } from './page-links.component';
import { PageLinkAutocompleteComponent } from '../page-link-autocomplete/page-link-autocomplete.component';

@Component({
  selector: 'app-page-links-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, PageLinksComponent, PageLinkAutocompleteComponent],
  template: `
    <div class="demo-container">
      <h2>Page Linking Demo</h2>
      
      <!-- Current Page Info -->
      <div class="current-page" *ngIf="currentPage">
        <h3>Current Page: {{ currentPage.title }}</h3>
        <p>Page ID: {{ currentPage.id }}</p>
      </div>

      <!-- Content Editor -->
      <div class="content-editor">
        <h4>Content Editor</h4>
        <p class="hint">Type [[Page Name]] to create links</p>
        
        <textarea
          [(ngModel)]="content"
          (input)="onContentChange()"
          placeholder="Start typing... Use [[Page Name]] to create links"
          class="content-textarea"
          rows="6"
        ></textarea>

        <!-- Autocomplete -->
        <app-page-link-autocomplete
          [isVisible]="showAutocomplete"
          [currentPageId]="currentPage?.id || ''"
          [blockId]="'demo-block'"
          [position]="cursorPosition"
          (pageSelected)="onPageSelected($event)"
          (pageCreated)="onPageCreated($event)"
          (cancelled)="onCancelled()">
        </app-page-link-autocomplete>
      </div>

      <!-- Page Links Display -->
      <div class="links-display" *ngIf="currentPage">
        <h4>Page Links</h4>
        <app-page-links [currentPageId]="currentPage.id!"></app-page-links>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button (click)="saveContent()" class="save-btn">Save Content</button>
        <button (click)="parseLinks()" class="parse-btn">Parse Links</button>
        <button (click)="loadSampleContent()" class="sample-btn">Load Sample</button>
      </div>

      <!-- Debug Info -->
      <div class="debug-info" *ngIf="debugMode">
        <h4>Debug Information</h4>
        <pre>{{ debugInfo | json }}</pre>
      </div>
    </div>
  `,
  styleUrls: ['./page-links-demo.component.scss']
})
export class PageLinksDemoComponent implements OnInit {
  currentPage: Page | null = null;
  content = '';
  showAutocomplete = false;
  cursorPosition = 0;
  debugMode = false;
  debugInfo: any = {};

  constructor(
    private pageService: PageService,
    private pageLinkParser: PageLinkParserService
  ) {}

  ngOnInit(): void {
    // Create a demo page for testing
    this.createDemoPage();
  }

  createDemoPage(): void {
    const demoPage: Page = {
      title: 'Page Linking Demo',
      icon: '🔗',
      blocks: []
    };

    this.pageService.createPage(demoPage).subscribe({
      next: (page) => {
        this.currentPage = page;
        console.log('Demo page created:', page);
      },
      error: (error) => {
        console.error('Error creating demo page:', error);
      }
    });
  }

  onContentChange(): void {
    // Check for [[ syntax to show autocomplete
    if (this.content.includes('[[')) {
      this.showAutocomplete = true;
    } else {
      this.showAutocomplete = false;
    }

    // Update debug info
    this.updateDebugInfo();
  }

  onPageSelected(page: Page): void {
    console.log('Page selected:', page);
    
    // Replace [[ with the selected page
    const pageName = page.title;
    this.content = this.content.replace(/\[\[[^\]]*\]\]/, `[[${pageName}]]`);
    
    this.showAutocomplete = false;
    this.updateDebugInfo();
  }

  onPageCreated(pageName: string): void {
    console.log('Creating new page:', pageName);
    
    // Create the new page
    const newPage: Page = {
      title: pageName,
      icon: '📄',
      blocks: []
    };

    this.pageService.createPage(newPage).subscribe({
      next: (page) => {
        console.log('New page created:', page);
        // Replace [[ with the new page
        this.content = this.content.replace(/\[\[[^\]]*\]\]/, `[[${pageName}]]`);
        this.showAutocomplete = false;
        this.updateDebugInfo();
      },
      error: (error) => {
        console.error('Error creating new page:', error);
      }
    });
  }

  onCancelled(): void {
    this.showAutocomplete = false;
  }

  saveContent(): void {
    if (!this.currentPage) return;

    // Update the page content
    const updatedPage: Page = {
      ...this.currentPage,
      blocks: [{ type: 'p', content: this.content }]
    };

    this.pageService.updatePage(this.currentPage.id!, updatedPage).subscribe({
      next: (page) => {
        console.log('Page updated:', page);
        this.currentPage = page;
        
        // Parse and create links
        this.parseLinks();
      },
      error: (error) => {
        console.error('Error updating page:', error);
      }
    });
  }

  parseLinks(): void {
    if (!this.currentPage) return;

    this.pageLinkParser.parseAndCreateLinks(
      this.content,
      this.currentPage.id!,
      'demo-block'
    ).subscribe({
      next: (links) => {
        console.log('Links created:', links);
        this.updateDebugInfo();
      },
      error: (error) => {
        console.error('Error parsing links:', error);
      }
    });
  }

  loadSampleContent(): void {
    this.content = `This is a demo page about page linking.

You can create links to other pages using the [[Page Name]] syntax.

For example:
- Check out [[Getting Started]] for basic information
- Read [[Advanced Features]] for more details
- Visit [[API Documentation]] for technical specs

This creates bidirectional links between pages!`;
    
    this.onContentChange();
  }

  updateDebugInfo(): void {
    this.debugInfo = {
      currentPage: this.currentPage,
      content: this.content,
      hasPageLinks: this.pageLinkParser.hasPageLinks(this.content),
      mentionedPages: this.pageLinkParser.getMentionedPages(this.content),
      showAutocomplete: this.showAutocomplete
    };
  }

  toggleDebugMode(): void {
    this.debugMode = !this.debugMode;
  }
} 