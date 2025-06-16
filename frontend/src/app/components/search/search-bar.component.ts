import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { SearchService, SearchFilters } from '../../services/search.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container" [class.active]="isActive">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (input)="onSearchInput()"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
          placeholder="Search pages..."
          class="search-input"
          [class.expanded]="isActive"
        />
        <button 
          *ngIf="searchQuery" 
          (click)="clearSearch()" 
          class="clear-btn"
          title="Clear search"
        >
          ×
        </button>
        <div class="search-shortcut">Ctrl+K</div>
      </div>

      <!-- Search suggestions dropdown -->
      <div class="search-suggestions" *ngIf="isActive && (suggestions.length > 0 || recentSearches.length > 0)">
        <div class="suggestions-header">
          <span class="header-text">Recent searches</span>
          <button 
            *ngIf="recentSearches.length > 0" 
            (click)="clearHistory()" 
            class="clear-history-btn"
            title="Clear search history"
          >
            Clear
          </button>
        </div>
        
        <div class="suggestion-item" 
             *ngFor="let suggestion of suggestions; let i = index"
             (click)="selectSuggestion(suggestion)"
             [class.selected]="selectedIndex === i"
        >
          <span class="suggestion-icon">🔍</span>
          <span class="suggestion-text">{{ suggestion }}</span>
        </div>

        <div class="suggestion-item" 
             *ngFor="let recent of recentSearches; let i = index"
             (click)="selectSuggestion(recent)"
             [class.selected]="selectedIndex === suggestions.length + i"
        >
          <span class="suggestion-icon">🕒</span>
          <span class="suggestion-text">{{ recent }}</span>
        </div>

        <div class="suggestions-footer" *ngIf="searchQuery">
          <span class="footer-text">Press Enter to search</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  searchQuery = '';
  isActive = false;
  suggestions: string[] = [];
  recentSearches: string[] = [];
  selectedIndex = 0;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to search input with debouncing
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.performSearch(query);
      });

    // Subscribe to recent searches
    this.searchService.recentSearches$
      .pipe(takeUntil(this.destroy$))
      .subscribe(searches => {
        this.recentSearches = searches;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Ctrl+K to focus search
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      this.focusSearch();
    }

    // Handle arrow keys in suggestions
    if (this.isActive && this.suggestions.length + this.recentSearches.length > 0) {
      const totalItems = this.suggestions.length + this.recentSearches.length;
      
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % totalItems;
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.selectedIndex = this.selectedIndex === 0 ? totalItems - 1 : this.selectedIndex - 1;
      } else if (event.key === 'Enter') {
        event.preventDefault();
        this.selectCurrentSuggestion();
      } else if (event.key === 'Escape') {
        this.closeSearch();
      }
    }
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onFocus(): void {
    this.isActive = true;
    this.loadSuggestions();
  }

  onBlur(): void {
    // Delay to allow clicking on suggestions
    setTimeout(() => {
      this.isActive = false;
    }, 200);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.searchQuery.trim()) {
      this.performSearch(this.searchQuery.trim());
      this.navigateToSearchResults();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.suggestions = [];
    this.selectedIndex = 0;
    this.searchService.clearSearchResults();
  }

  clearHistory(): void {
    this.searchService.clearSearchHistory();
  }

  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.performSearch(suggestion);
    this.navigateToSearchResults();
    this.closeSearch();
  }

  selectCurrentSuggestion(): void {
    const allSuggestions = [...this.suggestions, ...this.recentSearches];
    if (this.selectedIndex < allSuggestions.length) {
      this.selectSuggestion(allSuggestions[this.selectedIndex]);
    } else if (this.searchQuery.trim()) {
      this.performSearch(this.searchQuery.trim());
      this.navigateToSearchResults();
    }
  }

  focusSearch(): void {
    const input = document.querySelector('.search-input') as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  }

  private performSearch(query: string): void {
    if (query && query.length >= 2) {
      const filters: SearchFilters = {};
      this.searchService.globalSearch(query, filters).subscribe();
    } else {
      this.suggestions = [];
    }
  }

  private loadSuggestions(): void {
    if (this.searchQuery && this.searchQuery.length >= 2) {
      this.searchService.getSearchSuggestions(this.searchQuery)
        .pipe(takeUntil(this.destroy$))
        .subscribe(suggestions => {
          this.suggestions = suggestions;
          this.selectedIndex = 0;
        });
    } else {
      this.suggestions = [];
    }
  }

  private navigateToSearchResults(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery.trim() } 
      });
    }
  }

  private closeSearch(): void {
    this.isActive = false;
    this.suggestions = [];
    this.selectedIndex = 0;
  }
} 