# Search Module for Notion Clone

## Overview

The Search Module provides comprehensive search functionality for the Notion clone application, including global search, search history, advanced filtering, and intelligent result ranking.

## Features

### 🔍 Global Search
- **Unified Search**: Search across all pages, titles, content, and links
- **Real-time Results**: Instant search with debounced input
- **Smart Ranking**: Results ranked by relevance with title matches prioritized
- **Content Snippets**: Shows relevant text snippets from search results

### 🎯 Advanced Filtering
- **Page Type**: Filter by collaborative or regular pages
- **Date Range**: Filter by today, this week, month, or year
- **Content Type**: Search in titles only, content only, or links only

### 📚 Search History
- **Automatic Tracking**: Saves search queries automatically
- **Quick Access**: Click on recent searches to repeat them
- **History Management**: Clear individual searches or entire history
- **Persistent Storage**: Search history saved in localStorage

### ⌨️ Keyboard Shortcuts
- **Ctrl+K**: Quick focus on search bar
- **Arrow Keys**: Navigate through search suggestions
- **Enter**: Execute search or select suggestion
- **Escape**: Close search suggestions

### 💡 Smart Suggestions
- **Auto-complete**: Based on recent searches
- **Search Tips**: Helpful guidance for new users
- **Empty States**: Clear messaging when no results found

## Components

### 1. SearchService (`search.service.ts`)
Core service that handles all search operations:

```typescript
// Global search with filters
searchService.globalSearch(query, filters).subscribe(results => {
  console.log('Search results:', results);
});

// Get search suggestions
searchService.getSearchSuggestions(query).subscribe(suggestions => {
  console.log('Suggestions:', suggestions);
});

// Clear search history
searchService.clearSearchHistory();
```

**Key Methods:**
- `globalSearch(query, filters)`: Main search method
- `searchPages(query)`: Search pages by title/content
- `searchCollaborativePages(query)`: Search only collaborative pages
- `searchPagesByLinkText(query)`: Search by link text
- `getSearchSuggestions(query)`: Get auto-complete suggestions
- `clearSearchResults()`: Clear current results
- `clearSearchHistory()`: Clear search history

### 2. SearchBarComponent (`search-bar.component.ts`)
Global search bar with suggestions and keyboard navigation:

```html
<app-search-bar></app-search-bar>
```

**Features:**
- Debounced search input (300ms)
- Search suggestions dropdown
- Recent searches display
- Keyboard navigation (Ctrl+K, arrows, enter, escape)
- Clear search functionality

### 3. SearchResultsComponent (`search-results.component.ts`)
Dedicated search results page with filtering:

```html
<app-search-results></app-search-results>
```

**Features:**
- Comprehensive result display
- Advanced filtering options
- Search history management
- Empty states and loading indicators
- Direct page actions (open, edit, create)

## Backend Integration

### SearchController (`SearchController.java`)
New backend controller for unified search:

```java
@GetMapping("/api/search")
public ResponseEntity<List<Page>> globalSearch(
    @RequestParam String query,
    @RequestParam(required = false) String pageType,
    @RequestParam(required = false) String dateRange,
    @RequestParam(required = false) String contentType
)
```

**Filtering Options:**
- `pageType`: "all", "collaborative", "regular"
- `dateRange`: "all", "today", "week", "month", "year"
- `contentType`: "all", "title", "content", "links"

## Search Algorithm

### Relevance Scoring
Results are ranked using a sophisticated scoring system:

1. **Title Match** (100 points)
   - Exact match: +100 points
   - Prefix match: +50 bonus points

2. **Content Match** (30 points)
   - Content contains query: +30 points
   - Multiple matches: +5 points per match

3. **Collaborative Bonus** (10 points)
   - Pages with collaborative editing: +10 points

4. **Recency Bonus** (5-10 points)
   - Updated in last week: +5 points
   - Updated today: +10 points

### Result Processing
- **Snippet Generation**: Extracts relevant text around search terms
- **Field Matching**: Identifies which fields contain matches
- **Result Sorting**: Orders by relevance score (highest first)

## Usage Examples

### Basic Search
```typescript
// Simple search
this.searchService.globalSearch('meeting notes').subscribe(results => {
  this.results = results;
});
```

### Advanced Search with Filters
```typescript
const filters: SearchFilters = {
  pageType: 'collaborative',
  dateRange: 'week',
  contentType: 'content'
};

this.searchService.globalSearch('project', filters).subscribe(results => {
  this.results = results;
});
```

### Search Suggestions
```typescript
this.searchService.getSearchSuggestions('meet').subscribe(suggestions => {
  this.suggestions = suggestions; // ['meeting notes', 'meeting agenda']
});
```

### Search History
```typescript
// Get recent searches
this.searchService.recentSearches$.subscribe(searches => {
  this.recentSearches = searches;
});

// Clear history
this.searchService.clearSearchHistory();
```

## Routing Integration

### Search Route
```typescript
{ path: 'search', canActivate: [AuthGuard], 
  loadComponent: () => import('./components/search/search-results.component')
    .then(m => m.SearchResultsComponent) }
```

### URL Parameters
- `?q=search+query`: Search query
- `?pageType=collaborative`: Filter by page type
- `?dateRange=week`: Filter by date range
- `?contentType=title`: Filter by content type

## Styling

### Modern Design
- Clean, minimalist interface
- Smooth animations and transitions
- Responsive design for all screen sizes
- Dark mode support
- Consistent with Notion's design language

### CSS Features
- Flexbox layouts for responsive design
- CSS Grid for complex layouts
- Custom animations and transitions
- Hover effects and micro-interactions
- Mobile-first responsive design

## Performance Optimizations

### Frontend
- **Debounced Search**: Prevents excessive API calls
- **Lazy Loading**: Search results component loaded on demand
- **TrackBy Functions**: Optimized change detection
- **Memory Management**: Proper subscription cleanup

### Backend
- **Efficient Filtering**: Stream-based filtering in Java
- **Indexed Queries**: MongoDB indexes for fast searches
- **Caching**: Search results cached in localStorage
- **Pagination Ready**: Framework supports result pagination

## Error Handling

### Frontend
- Network error handling with retry options
- Graceful degradation for failed searches
- User-friendly error messages
- Loading states and timeouts

### Backend
- Comprehensive exception handling
- Proper HTTP status codes
- Detailed error logging
- Fallback search strategies

## Testing

### Unit Tests
```typescript
describe('SearchService', () => {
  it('should perform global search', () => {
    // Test implementation
  });
  
  it('should apply filters correctly', () => {
    // Test implementation
  });
});
```

### Integration Tests
- End-to-end search flow testing
- API endpoint testing
- Cross-browser compatibility
- Mobile responsiveness testing

## Future Enhancements

### Planned Features
1. **Full-Text Search**: Advanced text search with stemming
2. **Search Analytics**: Track popular searches and trends
3. **Saved Searches**: Save and share search queries
4. **Search Operators**: Advanced search syntax (AND, OR, NOT)
5. **Fuzzy Search**: Handle typos and partial matches
6. **Search Export**: Export search results to various formats

### Performance Improvements
1. **Elasticsearch Integration**: For large-scale search
2. **Search Indexing**: Background indexing of content
3. **Result Caching**: Redis-based caching for frequent searches
4. **Search Suggestions**: AI-powered search suggestions

## Troubleshooting

### Common Issues

1. **Search Not Working**
   - Check network connectivity
   - Verify backend is running
   - Check browser console for errors

2. **No Results Found**
   - Verify search query length (minimum 2 characters)
   - Check filter settings
   - Ensure pages exist in database

3. **Slow Search Performance**
   - Check database indexes
   - Monitor network latency
   - Consider implementing pagination

### Debug Mode
Enable debug logging in browser console:
```typescript
// Enable search service debugging
localStorage.setItem('debug_search', 'true');
```

## API Documentation

### Search Endpoints

#### Global Search
```http
GET /api/search?query=search+term&pageType=collaborative&dateRange=week&contentType=content
```

#### Page Search
```http
GET /api/pages/search?query=search+term
```

#### Collaborative Page Search
```http
GET /api/collaborative/pages/search?query=search+term
```

#### Link Text Search
```http
GET /api/page-links/search?query=search+term
```

### Response Format
```json
{
  "page": {
    "id": "page-id",
    "title": "Page Title",
    "content": "Page content...",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "relevance": 150,
  "matchedFields": ["title", "content"],
  "snippet": "...relevant text snippet..."
}
```

## Conclusion

The Search Module provides a comprehensive, user-friendly search experience that enhances the Notion clone application. With advanced filtering, smart ranking, and seamless integration, users can quickly find the content they need across their workspace.

The modular design ensures easy maintenance and extensibility, while the performance optimizations provide a smooth user experience even with large datasets. 