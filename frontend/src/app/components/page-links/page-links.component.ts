import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Page, PageService } from '../../services/page.service';

@Component({
  selector: 'app-page-links',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-links-container">
      <!-- Linked Pages Section -->
      <div class="links-section" *ngIf="linkedPages.length > 0">
        <h3 class="section-title">
          <span class="icon">🔗</span>
          Linked Pages ({{ linkedPages.length }})
        </h3>
        <div class="pages-list">
          <div 
            *ngFor="let page of linkedPages" 
            class="page-item"
            (click)="navigateToPage(page.id!)"
          >
            <span class="page-icon">{{ page.icon || '📄' }}</span>
            <span class="page-title">{{ page.title }}</span>
            <span class="page-arrow">→</span>
          </div>
        </div>
      </div>

      <!-- Backlinks Section -->
      <div class="links-section" *ngIf="backlinkPages.length > 0">
        <h3 class="section-title">
          <span class="icon">↩️</span>
          Backlinks ({{ backlinkPages.length }})
        </h3>
        <div class="pages-list">
          <div 
            *ngFor="let page of backlinkPages" 
            class="page-item"
            (click)="navigateToPage(page.id!)"
          >
            <span class="page-arrow">←</span>
            <span class="page-icon">{{ page.icon || '📄' }}</span>
            <span class="page-title">{{ page.title }}</span>
          </div>
        </div>
      </div>

      <!-- No Links Message -->
      <div class="no-links" *ngIf="linkedPages.length === 0 && backlinkPages.length === 0">
        <p>No page links found</p>
        <p class="hint">Create links by typing [[Page Name]] in your content</p>
      </div>
    </div>
  `,
  styleUrls: ['./page-links.component.scss']
})
export class PageLinksComponent implements OnInit, OnDestroy {
  @Input() currentPageId!: string;

  linkedPages: Page[] = [];
  backlinkPages: Page[] = [];
  loading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private pageService: PageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.currentPageId) {
      this.loadPageLinks();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPageLinks(): void {
    this.loading = true;

    // Load linked pages (pages this page links to)
    this.pageService.getLinkedPages(this.currentPageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pages) => {
          this.linkedPages = pages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading linked pages:', error);
          this.loading = false;
        }
      });

    // Load backlink pages (pages that link to this page)
    this.pageService.getBacklinkPages(this.currentPageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pages) => {
          this.backlinkPages = pages;
        },
        error: (error) => {
          console.error('Error loading backlink pages:', error);
        }
      });
  }

  navigateToPage(pageId: string): void {
    this.router.navigate(['/workspace/page', pageId]);
  }

  refreshLinks(): void {
    this.loadPageLinks();
  }
} 