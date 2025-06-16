# Page Linking/Backlinks Feature

## Overview

The Page Linking/Backlinks feature allows users to create bidirectional links between pages in the Notion clone, similar to how Notion's page linking works. Users can create links using the `[[Page Name]]` syntax and view both outgoing links and incoming backlinks.

## Features

### 1. **Page Link Creation**
- **Syntax**: Use `[[Page Name]]` in any text block to create a link
- **Auto-completion**: Intelligent suggestions when typing `[[`
- **Real-time parsing**: Links are automatically detected and created
- **Duplicate prevention**: Prevents creating duplicate links

### 2. **Backlinks Display**
- **Incoming links**: Shows all pages that link to the current page
- **Outgoing links**: Shows all pages that the current page links to
- **Visual indicators**: Clear arrows showing link direction
- **Click navigation**: Click any linked page to navigate to it

### 3. **Link Management**
- **Automatic cleanup**: Links are removed when pages are deleted
- **Link validation**: Ensures both source and target pages exist
- **Position tracking**: Tracks where links appear in content

## Backend Implementation

### Models

#### Page Model Updates
```java
public class Page {
    // ... existing fields ...
    
    // Page linking fields
    private Set<String> linkedPageIds; // Pages that this page links to
    private Set<String> backlinkPageIds; // Pages that link to this page
}
```

#### PageLink Model
```java
public class PageLink {
    private String id;
    private String sourcePageId; // Page that contains the link
    private String targetPageId; // Page that is linked to
    private String linkText; // Optional text for the link
    private String blockId; // ID of the block containing the link
    private Integer position; // Position within the block
    private Instant createdAt;
    private Instant updatedAt;
}
```

### Services

#### PageLinkService
- `createLink()`: Creates a new page link
- `removeLink()`: Removes a specific link
- `getLinksFromPage()`: Gets all links from a page
- `getBacklinksToPage()`: Gets all backlinks to a page
- `getLinkedPages()`: Gets pages that a page links to
- `getBacklinkPages()`: Gets pages that link to a page
- `removeAllLinksForPage()`: Cleans up all links when a page is deleted

### API Endpoints

#### Page Links
- `POST /api/page-links` - Create a page link
- `DELETE /api/page-links/{sourcePageId}/{targetPageId}/{blockId}` - Remove a link
- `GET /api/page-links/from/{pageId}` - Get links from a page
- `GET /api/page-links/to/{pageId}` - Get backlinks to a page
- `GET /api/page-links/{pageId}/linked-pages` - Get linked pages
- `GET /api/page-links/{pageId}/backlink-pages` - Get backlink pages
- `GET /api/page-links/search?query=term` - Search pages by link text
- `DELETE /api/page-links/page/{pageId}` - Remove all links for a page

## Frontend Implementation

### Components

#### PageLinksComponent
- Displays linked pages and backlinks
- Shows link counts
- Provides navigation to linked pages
- Responsive design with hover effects

#### PageLinkAutocompleteComponent
- Search interface for finding pages to link
- Real-time suggestions
- Keyboard navigation support
- Option to create new pages

### Services

#### PageService Updates
```typescript
export interface Page {
  // ... existing fields ...
  linkedPageIds?: string[]; // Pages that this page links to
  backlinkPageIds?: string[]; // Pages that link to this page
}

export interface PageLink {
  id?: string;
  sourcePageId: string;
  targetPageId: string;
  linkText?: string;
  blockId: string;
  position?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

#### PageLinkParserService
- `parseAndCreateLinks()`: Parses content and creates links
- `extractPageNames()`: Extracts page names from `[[Page Name]]` syntax
- `convertToClickableLinks()`: Converts syntax to clickable HTML
- `getSuggestedPages()`: Provides autocomplete suggestions
- `hasPageLinks()`: Checks if content contains page links

## Usage Examples

### Creating Page Links

1. **Manual Creation**:
   ```typescript
   const link: PageLink = {
     sourcePageId: 'page1-id',
     targetPageId: 'page2-id',
     linkText: 'Related Page',
     blockId: 'block-id',
     position: 10
   };
   
   this.pageService.createPageLink(link).subscribe(link => {
     console.log('Link created:', link);
   });
   ```

2. **Using Parser**:
   ```typescript
   const content = "Check out [[Related Page]] for more information.";
   this.pageLinkParser.parseAndCreateLinks(content, pageId, blockId)
     .subscribe(links => {
       console.log('Links created:', links);
     });
   ```

### Displaying Links

```html
<app-page-links [currentPageId]="currentPage.id"></app-page-links>
```

### Autocomplete Integration

```html
<app-page-link-autocomplete
  [isVisible]="showAutocomplete"
  [currentPageId]="currentPage.id"
  [blockId]="currentBlock.id"
  [position]="cursorPosition"
  (pageSelected)="onPageSelected($event)"
  (pageCreated)="onPageCreated($event)"
  (cancelled)="onCancelled()">
</app-page-link-autocomplete>
```

## Integration with Block Editor

### Content Parsing
The block editor can integrate page linking by:

1. **Detecting `[[` syntax**:
   ```typescript
   onContentChange(content: string) {
     if (content.includes('[[')) {
       this.showAutocomplete = true;
       this.parsePageLinks(content);
     }
   }
   ```

2. **Creating links on content save**:
   ```typescript
   saveContent() {
     // Save block content
     this.saveBlock();
     
     // Parse and create page links
     this.pageLinkParser.parseAndCreateLinks(
       this.content, 
       this.pageId, 
       this.blockId
     ).subscribe();
   }
   ```

## Database Schema

### Pages Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  title: String,
  // ... other fields ...
  linkedPageIds: [String],    // Pages this page links to
  backlinkPageIds: [String]   // Pages that link to this page
}
```

### Page Links Collection
```javascript
{
  _id: ObjectId,
  sourcePageId: String,    // Page containing the link
  targetPageId: String,    // Page being linked to
  linkText: String,        // Display text for the link
  blockId: String,         // Block containing the link
  position: Number,        // Position within the block
  createdAt: Date,
  updatedAt: Date
}
```

## Performance Considerations

### Indexing
```javascript
// Page Links collection indexes
db.page_links.createIndex({ "sourcePageId": 1 });
db.page_links.createIndex({ "targetPageId": 1 });
db.page_links.createIndex({ "sourcePageId": 1, "targetPageId": 1 });
db.page_links.createIndex({ "blockId": 1 });

// Pages collection indexes
db.pages.createIndex({ "linkedPageIds": 1 });
db.pages.createIndex({ "backlinkPageIds": 1 });
```

### Caching
- Cache frequently accessed link data
- Use Redis for link relationship caching
- Implement link prefetching for better UX

## Error Handling

### Common Scenarios
1. **Page not found**: Gracefully handle missing target pages
2. **Circular links**: Prevent infinite loops
3. **Invalid syntax**: Validate `[[Page Name]]` format
4. **Permission errors**: Handle unauthorized access

### Error Responses
```json
{
  "error": "Page not found",
  "message": "Target page 'Page Name' does not exist",
  "code": "PAGE_NOT_FOUND"
}
```

## Testing

### Backend Tests
```java
@Test
public void testCreatePageLink() {
    PageLink link = pageLinkService.createLink(
        "source-id", "target-id", "Link Text", "block-id", 0
    );
    assertNotNull(link.getId());
    assertEquals("source-id", link.getSourcePageId());
}

@Test
public void testGetBacklinks() {
    List<Page> backlinks = pageLinkService.getBacklinkPages("page-id");
    assertFalse(backlinks.isEmpty());
}
```

### Frontend Tests
```typescript
describe('PageLinkParserService', () => {
  it('should extract page names from content', () => {
    const content = 'Check [[Page 1]] and [[Page 2]]';
    const names = service.extractPageNames(content);
    expect(names).toEqual(['Page 1', 'Page 2']);
  });
});
```

## Future Enhancements

1. **Link Types**: Different types of links (mentions, references, etc.)
2. **Link Context**: Show surrounding text for backlinks
3. **Link Analytics**: Track link usage and popularity
4. **Bidirectional Sync**: Real-time link updates across pages
5. **Link Suggestions**: AI-powered link recommendations
6. **Link Visualization**: Graph view of page relationships

## Troubleshooting

### Common Issues

1. **Links not appearing**:
   - Check if target page exists
   - Verify user permissions
   - Check network connectivity

2. **Autocomplete not working**:
   - Ensure search query is at least 2 characters
   - Check if pages exist in database
   - Verify API endpoints are accessible

3. **Performance issues**:
   - Add database indexes
   - Implement caching
   - Optimize queries

### Debug Mode
Enable debug logging in `application.properties`:
```properties
logging.level.com.clone.notion.service.PageLinkService=DEBUG
```

## Conclusion

The Page Linking/Backlinks feature provides a powerful way to connect related content across the Notion clone. The implementation is robust, scalable, and provides an excellent user experience with real-time updates and intelligent suggestions. 