import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Page } from '../../models/page.model';
import { PageService } from '../../services/page.service';
import { PageLinkParserService } from '../../services/page-link-parser.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-page-link-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="autocomplete-container" *ngIf="isVisible">
      <div class="autocomplete-header">
        <span class="icon">🔗</span>
        <span class="title">Link to page</span>
      </div>
      
      <div class="search-container">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (input)="onSearchInput()"
          placeholder="Search pages..."
          class="search-input"
          autofocus
        />
      </div>

      <div class="suggestions-container" *ngIf="suggestions.length > 0">
        <div class="suggestion-item"
             *ngFor="let page of suggestions; trackBy: trackByPageId"
             (click)="selectPage(page)"
             [class.selected]="selectedIndex === suggestions.indexOf(page)"
        >
          <span class="page-icon">{{ page.icon || '📄' }}</span>
          <span class="page-title">{{ page.title }}</span>
          <span class="page-hint">Click to link</span>
        </div>
      </div>

      <div class="no-results" *ngIf="searchQuery && suggestions.length === 0">
        <p>No pages found</p>
        <button class="create-page-btn" (click)="createNewPage()">
          Create "{{ searchQuery }}"
        </button>
      </div>

      <div class="autocomplete-footer">
        <button class="cancel-btn" (click)="cancel()">Cancel</button>
      </div>
    </div>
  `,
  styleUrls: ['./page-link-autocomplete.component.scss']
})
export class PageLinkAutocompleteComponent implements OnInit, OnDestroy {
  @Input() isVisible = false;
  @Input() currentPageId!: string;
  @Input() blockId!: string;
  @Input() position!: number;
  
  @Output() pageSelected = new EventEmitter<Page>();
  @Output() pageCreated = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  searchQuery = '';
  suggestions: Page[] = [];
  selectedIndex = 0;
  loading = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private pageService: PageService,
    private pageLinkParser: PageLinkParserService
  ) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.performSearch(query);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  performSearch(query: string): void {
    if (!query || query.length < 2) {
      this.suggestions = [];
      return;
    }

    this.loading = true;
    this.pageLinkParser.getSuggestedPages(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pages) => {
          // Filter out current page
          this.suggestions = pages.filter(page => page.id !== this.currentPageId);
          this.selectedIndex = 0;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching pages:', error);
          this.suggestions = [];
          this.loading = false;
        }
      });
  }

  selectPage(page: Page): void {
    this.pageSelected.emit(page);
    this.reset();
  }

  createNewPage(): void {
    if (this.searchQuery.trim()) {
      this.pageCreated.emit(this.searchQuery.trim());
    }
    this.reset();
  }

  cancel(): void {
    this.cancelled.emit();
    this.reset();
  }

  reset(): void {
    this.searchQuery = '';
    this.suggestions = [];
    this.selectedIndex = 0;
    this.isVisible = false;
  }

  trackByPageId(index: number, page: Page): string {
    return page.id || '';
  }

  // Keyboard navigation
  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.suggestions.length > 0) {
          this.selectPage(this.suggestions[this.selectedIndex]);
        } else if (this.searchQuery.trim()) {
          this.createNewPage();
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.cancel();
        break;
    }
  }
} 