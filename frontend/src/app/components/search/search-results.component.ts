import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SearchService, SearchResult, SearchFilters } from '../../services/search.service';
import { Page } from '../../models/page.model';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-results-container">
      <!-- Search Header -->
      <div class="search-header">
        <div class="search-info">
          <h1 class="search-title">
            <span class="search-icon">🔍</span>
            Search Results
          </h1>
          <div class="search-stats" *ngIf="searchQuery">
            <span class="results-count">{{ results.length }} results</span>
            <span class="search-query">for "{{ searchQuery }}"</span>
          </div>
        </div>
        
        <div class="search-actions">
          <button 
            class="clear-search-btn" 
            (click)="clearSearch()"
            *ngIf="searchQuery"
          >
            Clear Search
          </button>
        </div>
      </div>

      <!-- Search Filters -->
      <div class="search-filters" *ngIf="searchQuery">
        <div class="filter-group">
          <label class="filter-label">Page Type:</label>
          <select 
            [(ngModel)]="filters.pageType" 
            (change)="applyFilters()"
            class="filter-select"
          >
            <option value="all">All Pages</option>
            <option value="collaborative">Collaborative</option>
            <option value="regular">Regular</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Date Range:</label>
          <select 
            [(ngModel)]="filters.dateRange" 
            (change)="applyFilters()"
            class="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Content Type:</label>
          <select 
            [(ngModel)]="filters.contentType" 
            (change)="applyFilters()"
            class="filter-select"
          >
            <option value="all">All Content</option>
            <option value="title">Title Only</option>
            <option value="content">Content Only</option>
            <option value="links">Links Only</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isSearching">
        <div class="spinner"></div>
        <p>Searching...</p>
      </div>

      <!-- No Results -->
      <div class="no-results" *ngIf="!isSearching && searchQuery && results.length === 0">
        <div class="no-results-icon">🔍</div>
        <h3>No results found</h3>
        <p>Try adjusting your search terms or filters</p>
        <button class="create-page-btn" (click)="createNewPage()">
          Create "{{ searchQuery }}"
        </button>
      </div>

      <!-- Search Results -->
      <div class="results-list" *ngIf="!isSearching && results.length > 0">
        <div 
          class="result-item" 
          *ngFor="let result of results; trackBy: trackByResult"
          (click)="openPage(result.page)"
        >
          <div class="result-header">
            <div class="result-icon">{{ result.page.icon || '📄' }}</div>
            <div class="result-title">{{ result.page.title || 'Untitled' }}</div>
            <div class="result-meta">
              <span class="relevance-score" *ngIf="result.relevance > 0">
                {{ result.relevance }}% match
              </span>
              <span class="page-type" *ngIf="result.page.convexDocId">
                🔗 Collaborative
              </span>
              <span class="updated-date" *ngIf="result.page.updatedAt">
                {{ result.page.updatedAt | date:'short' }}
              </span>
            </div>
          </div>

          <div class="result-snippet" *ngIf="result.snippet">
            <p>{{ result.snippet }}</p>
          </div>

          <div class="result-tags" *ngIf="result.matchedFields.length > 0">
            <span 
              class="tag" 
              *ngFor="let field of result.matchedFields"
              [class]="'tag-' + field"
            >
              {{ field }}
            </span>
          </div>

          <div class="result-actions">
            <button 
              class="action-btn open-btn" 
              (click)="openPage(result.page); $event.stopPropagation()"
            >
              Open
            </button>
            <button 
              class="action-btn edit-btn" 
              (click)="editPage(result.page); $event.stopPropagation()"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      <!-- Search History -->
      <div class="search-history" *ngIf="!searchQuery && searchHistory.length > 0">
        <h3>Recent Searches</h3>
        <div class="history-list">
          <div 
            class="history-item" 
            *ngFor="let item of searchHistory"
            (click)="repeatSearch(item.query)"
          >
            <span class="history-icon">🕒</span>
            <span class="history-query">{{ item.query }}</span>
            <span class="history-time">{{ item.timestamp | date:'short' }}</span>
          </div>
        </div>
        <button class="clear-history-btn" (click)="clearHistory()">
          Clear History
        </button>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!searchQuery && searchHistory.length === 0">
        <div class="empty-icon">🔍</div>
        <h3>Start searching</h3>
        <p>Use the search bar above to find your pages</p>
        <div class="search-tips">
          <h4>Search Tips:</h4>
          <ul>
            <li>Search by page title or content</li>
            <li>Use filters to narrow results</li>
            <li>Press Ctrl+K for quick search</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  searchQuery = '';
  results: SearchResult[] = [];
  searchHistory: any[] = [];
  isSearching = false;
  filters: SearchFilters = {
    pageType: 'all',
    dateRange: 'all',
    contentType: 'all'
  };

  private destroy$ = new Subject<void>();

  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to route query parameters
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: any) => {
        this.searchQuery = params['q'] || '';
        if (this.searchQuery) {
          this.performSearch();
        }
      });

    // Subscribe to search results
    this.searchService.searchResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        this.results = results;
      });

    // Subscribe to search loading state
    this.searchService.isSearching$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isSearching => {
        this.isSearching = isSearching;
      });

    // Subscribe to search history
    this.searchService.searchHistory$
      .pipe(takeUntil(this.destroy$))
      .subscribe(history => {
        this.searchHistory = history;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  performSearch(): void {
    if (this.searchQuery) {
      console.log('[DEBUG] Performing search for:', this.searchQuery, this.filters);
      this.searchService.globalSearch(this.searchQuery, this.filters).subscribe();
    }
  }

  applyFilters(): void {
    if (this.searchQuery) {
      this.performSearch();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.results = [];
    this.searchService.clearSearchResults();
    this.router.navigate(['/search']);
  }

  clearHistory(): void {
    this.searchService.clearSearchHistory();
  }

  repeatSearch(query: string): void {
    this.searchQuery = query;
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  openPage(page: Page): void {
    if (page.id) {
      this.router.navigate(['/workspace/page', page.id]);
    }
  }

  editPage(page: Page): void {
    if (page.id) {
      this.router.navigate(['/workspace/page', page.id], { 
        queryParams: { edit: 'true' } 
      });
    }
  }

  createNewPage(): void {
    if (this.searchQuery) {
      this.router.navigate(['/workspace/page/new'], { 
        queryParams: { title: this.searchQuery } 
      });
    }
  }

  trackByResult(index: number, result: SearchResult): string {
    return result.page.id || index.toString();
  }
} 