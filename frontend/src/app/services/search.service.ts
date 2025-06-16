import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Page } from '../models/page.model';
import { getBlockText } from '../models/block.model';

export interface SearchResult {
  page: Page;
  relevance: number;
  matchedFields: string[];
  snippet: string;
}

export interface SearchFilters {
  pageType?: 'all' | 'collaborative' | 'regular';
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  contentType?: 'all' | 'title' | 'content' | 'links';
}

export interface SearchQuery {
  query: string;
  filters: SearchFilters;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private apiUrl = 'http://localhost:8080/api';
  private searchHistoryKey = 'notion_search_history';
  private maxHistoryItems = 10;

  private searchHistorySubject = new BehaviorSubject<SearchQuery[]>([]);
  private recentSearchesSubject = new BehaviorSubject<string[]>([]);
  private searchResultsSubject = new BehaviorSubject<SearchResult[]>([]);
  private isSearchingSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadSearchHistory();
  }

  // Observable getters
  get searchHistory$() { return this.searchHistorySubject.asObservable(); }
  get recentSearches$() { return this.recentSearchesSubject.asObservable(); }
  get searchResults$() { return this.searchResultsSubject.asObservable(); }
  get isSearching$() { return this.isSearchingSubject.asObservable(); }

  // Global search method
  globalSearch(query: string, filters: SearchFilters = {}): Observable<SearchResult[]> {
    if (!query || query.trim().length < 1) {
      this.searchResultsSubject.next([]);
      return of([]);
    }

    this.isSearchingSubject.next(true);
    const trimmedQuery = query.trim();

    // Add to search history
    this.addToSearchHistory(trimmedQuery, filters);

    // Build search parameters
    let params = new HttpParams().set('query', trimmedQuery);
    
    if (filters.pageType && filters.pageType !== 'all') {
      params = params.set('pageType', filters.pageType);
    }
    if (filters.dateRange && filters.dateRange !== 'all') {
      params = params.set('dateRange', filters.dateRange);
    }
    if (filters.contentType && filters.contentType !== 'all') {
      params = params.set('contentType', filters.contentType);
    }

    console.log('[DEBUG] Sending search request to:', `${this.apiUrl}/search`, params.toString());

    return this.http.get<Page[]>(`${this.apiUrl}/search`, { params }).pipe(
      map(pages => this.processSearchResults(pages, trimmedQuery)),
      tap(results => {
        this.searchResultsSubject.next(results);
        this.isSearchingSubject.next(false);
      }),
      catchError(error => {
        console.error('Search error:', error);
        this.isSearchingSubject.next(false);
        return of([]);
      })
    );
  }

  // Search pages by title/content
  searchPages(query: string): Observable<Page[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Page[]>(`${this.apiUrl}/pages/search`, { params });
  }

  // Search collaborative pages
  searchCollaborativePages(query: string): Observable<Page[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Page[]>(`${this.apiUrl}/collaborative/pages/search`, { params });
  }

  // Search pages by link text
  searchPagesByLinkText(query: string): Observable<Page[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Page[]>(`${this.apiUrl}/page-links/search`, { params });
  }

  // Get search suggestions based on recent searches
  getSearchSuggestions(query: string): Observable<string[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    const history = this.searchHistorySubject.value;
    const suggestions = history
      .map(item => item.query)
      .filter(searchQuery => 
        searchQuery.toLowerCase().includes(query.toLowerCase()) &&
        searchQuery !== query
      )
      .slice(0, 5);

    return of(suggestions);
  }

  // Clear search results
  clearSearchResults(): void {
    this.searchResultsSubject.next([]);
  }

  // Clear search history
  clearSearchHistory(): void {
    localStorage.removeItem(this.searchHistoryKey);
    this.searchHistorySubject.next([]);
    this.recentSearchesSubject.next([]);
  }

  // Get search history
  getSearchHistory(): SearchQuery[] {
    return this.searchHistorySubject.value;
  }

  // Get recent searches (just the query strings)
  getRecentSearches(): string[] {
    return this.recentSearchesSubject.value;
  }

  // Private methods

  private processSearchResults(pages: Page[], query: string): SearchResult[] {
    return pages.map(page => {
      const relevance = this.calculateRelevance(page, query);
      const matchedFields = this.getMatchedFields(page, query);
      const snippet = this.generateSnippet(page, query);

      return {
        page,
        relevance,
        matchedFields,
        snippet
      };
    }).sort((a, b) => b.relevance - a.relevance);
  }

  private calculateRelevance(page: Page, query: string): number {
    let relevance = 0;
    const queryLower = query.toLowerCase();

    // Title match (highest weight)
    if (page.title?.toLowerCase().includes(queryLower)) {
      relevance += 100;
      if (page.title.toLowerCase().startsWith(queryLower)) {
        relevance += 50; // Bonus for prefix match
      }
    }

    // Content match
    if (page.blocks) {
      const contentText = page.blocks
        .map((block: any) => getBlockText(block))
        .join(' ')
        .toLowerCase();
      
      if (contentText.includes(queryLower)) {
        relevance += 30;
        const matchCount = (contentText.match(new RegExp(queryLower, 'g')) || []).length;
        relevance += matchCount * 5; // Bonus for multiple matches
      }
    }

    // Collaborative editing bonus
    if (page.convexDocId) {
      relevance += 10;
    }

    // Recency bonus
    if (page.updatedAt) {
      const daysSinceUpdate = (Date.now() - new Date(page.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 7) relevance += 5;
      if (daysSinceUpdate < 1) relevance += 10;
    }

    return relevance;
  }

  private getMatchedFields(page: Page, query: string): string[] {
    const matchedFields: string[] = [];
    const queryLower = query.toLowerCase();

    if (page.title?.toLowerCase().includes(queryLower)) {
      matchedFields.push('title');
    }

    if (page.blocks) {
      const hasContentMatch = page.blocks.some((block: any) => 
        getBlockText(block).toLowerCase().includes(queryLower)
      );
      if (hasContentMatch) {
        matchedFields.push('content');
      }
    }

    if (page.linkedPageIds && page.linkedPageIds.length > 0) {
      matchedFields.push('links');
    }

    return matchedFields;
  }

  private generateSnippet(page: Page, query: string): string {
    const queryLower = query.toLowerCase();
    let snippet = '';

    // Try to get snippet from content
    if (page.blocks) {
      for (const block of page.blocks) {
        if (getBlockText(block).toLowerCase().includes(queryLower)) {
          const content = getBlockText(block);
          const index = content.toLowerCase().indexOf(queryLower);
          const start = Math.max(0, index - 50);
          const end = Math.min(content.length, index + query.length + 50);
          snippet = content.substring(start, end);
          
          if (start > 0) snippet = '...' + snippet;
          if (end < content.length) snippet = snippet + '...';
          
          break;
        }
      }
    }

    // Fallback to title if no content snippet
    if (!snippet && page.title) {
      snippet = page.title;
    }

    return snippet;
  }

  private addToSearchHistory(query: string, filters: SearchFilters): void {
    const history = this.searchHistorySubject.value;
    const newSearch: SearchQuery = {
      query,
      filters,
      timestamp: new Date()
    };

    // Remove existing entry with same query
    const filteredHistory = history.filter(item => item.query !== query);
    
    // Add new search at the beginning
    const updatedHistory = [newSearch, ...filteredHistory].slice(0, this.maxHistoryItems);
    
    this.searchHistorySubject.next(updatedHistory);
    this.recentSearchesSubject.next(updatedHistory.map(item => item.query));
    
    // Save to localStorage
    this.saveSearchHistory(updatedHistory);
  }

  private loadSearchHistory(): void {
    try {
      const stored = localStorage.getItem(this.searchHistoryKey);
      if (stored) {
        const history: SearchQuery[] = JSON.parse(stored);
        this.searchHistorySubject.next(history);
        this.recentSearchesSubject.next(history.map(item => item.query));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }

  private saveSearchHistory(history: SearchQuery[]): void {
    try {
      localStorage.setItem(this.searchHistoryKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }
} 