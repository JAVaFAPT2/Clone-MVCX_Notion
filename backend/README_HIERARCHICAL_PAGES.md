# Hierarchical Pages Implementation

## Overview

This implementation adds full hierarchical page support with drag-and-drop functionality to the Notion clone. Users can now organize pages in a tree structure with parent-child relationships and reorder pages via drag-and-drop.

## Features Implemented

### 1. Sidebar-Editor Integration
- **PageSelectionService**: Shared state management for selected pages
- **Click-to-Edit**: Click any page in sidebar to load it in the main editor
- **Real-time Updates**: Editor automatically loads selected page content

### 2. Drag-and-Drop Support
- **Angular CDK Integration**: Full drag-and-drop using Angular CDK
- **Visual Feedback**: Drag preview, drop targets, and opacity changes
- **Multi-level Support**: Drag between root level and nested pages
- **Error Handling**: Failed operations revert UI and show console errors

### 3. Backend Hierarchical Support
- **Order Field**: Added `order` field to `Page` model for sibling ordering
- **Move Operations**: `movePage()` and `updateOrder()` methods with automatic reordering
- **New Endpoints**: `PUT /api/pages/{id}/move` and `PUT /api/pages/{id}/order`
- **Repository Updates**: Pages returned ordered by `parentId` and `order`

## API Endpoints

### New Hierarchical Endpoints

#### Move Page
```http
PUT /api/pages/{id}/move
Content-Type: application/json

{
  "newParentId": "parent-page-id-or-null",
  "newOrder": 2
}
```

#### Update Page Order
```http
PUT /api/pages/{id}/order
Content-Type: application/json

2
```

### Updated Endpoints

#### Get All Pages (Now Ordered)
```http
GET /api/pages
```
Returns pages ordered by `parentId` and `order` for proper tree building.

#### Create Page (Now with Order)
```http
POST /api/pages
Content-Type: application/json

{
  "title": "New Page",
  "parentId": "parent-page-id",
  "order": 1,
  "icon": "📄"
}
```

## Data Model Changes

### Page Model
```java
public class Page {
    private String id;
    private String userId;
    private String parentId;        // For hierarchical structure
    private Integer order;          // NEW: For sibling ordering
    private String icon;
    private String title;
    private List<Block> blocks;
    private String convexDocId;
    private Instant createdAt;
    private Instant updatedAt;
}
```

### MovePageRequest
```java
public class MovePageRequest {
    private String newParentId;     // null for root level
    private Integer newOrder;       // Position within siblings
}
```

## Frontend Integration

### PageSelectionService
```typescript
@Injectable({ providedIn: 'root' })
export class PageSelectionService {
  selectPage(page: Page | null): void
  getSelectedPage(): Observable<Page | null>
  getCurrentPage(): Page | null
}
```

### PageTreeService Updates
```typescript
movePage(id: string, newParentId: string | null, newOrder: number): Observable<PageNode>
updateOrder(id: string, newOrder: number): Observable<PageNode>
```

### Sidebar Component
- **Drag-and-Drop**: `cdkDropList` and `cdkDrag` directives
- **Event Handlers**: `drop()` and `dropChild()` for different levels
- **Backend Integration**: Automatic API calls on successful drops

## Testing Instructions

### 1. Backend Testing

#### Prerequisites
- Java 21+
- MongoDB running on localhost:27017
- Maven (optional, can use IDE)

#### Start Backend
```bash
# Using Maven
mvn spring-boot:run

# Or using IDE
# Run NotionApplication.java
```

#### Test Endpoints
```bash
# 1. Register a user
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 2. Login to get JWT token
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"testuser","password":"password123"}'

# 3. Create root pages
curl -X POST http://localhost:8080/api/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Root Page 1","icon":"📄"}'

curl -X POST http://localhost:8080/api/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Root Page 2","icon":"📄"}'

# 4. Create child pages
curl -X POST http://localhost:8080/api/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Child Page 1","parentId":"PARENT_PAGE_ID","icon":"📄"}'

# 5. Move a page
curl -X PUT http://localhost:8080/api/pages/PAGE_ID/move \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"newParentId":"NEW_PARENT_ID","newOrder":1}'

# 6. Update page order
curl -X PUT http://localhost:8080/api/pages/PAGE_ID/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '2'
```

### 2. Frontend Testing

#### Prerequisites
- Node.js 22+
- Angular CLI

#### Start Frontend
```bash
cd frontend
npm install
ng serve
```

#### Test Features
1. **Page Selection**: Click pages in sidebar → should load in editor
2. **Drag-and-Drop**: 
   - Drag pages to reorder within same level
   - Drag pages between different levels (root ↔ children)
   - Check console for success/error messages
3. **Hierarchical Display**: Pages should display in proper tree structure
4. **Persistence**: Refresh page → drag-and-drop changes should persist

### 3. Integration Testing

#### Complete Workflow
1. Create multiple pages with different parent-child relationships
2. Use drag-and-drop to reorganize the hierarchy
3. Click different pages to ensure editor loads correct content
4. Verify changes persist after page refresh
5. Test error scenarios (network issues, invalid moves)

## Error Handling

### Backend Errors
- **403 Forbidden**: User not authorized to modify page
- **404 Not Found**: Page doesn't exist
- **500 Internal Server Error**: Server-side issues

### Frontend Errors
- **Console Logs**: Success/error messages for all operations
- **UI Revert**: Failed operations automatically revert UI state
- **Page Reload**: Automatic reload on failed operations to sync state

## Performance Considerations

### Backend
- **Automatic Reordering**: Efficient sibling reordering algorithms
- **Database Indexes**: Consider adding indexes on `userId`, `parentId`, `order`
- **Batch Operations**: Future enhancement for multiple page moves

### Frontend
- **Optimistic Updates**: UI updates immediately, reverts on failure
- **Minimal Reloads**: Only reload page tree when necessary
- **Debounced Operations**: Consider debouncing rapid drag operations

## Future Enhancements

1. **Visual Indicators**: Better drag targets and drop zones
2. **Keyboard Navigation**: Arrow keys for page navigation
3. **Batch Operations**: Select multiple pages for bulk moves
4. **Undo/Redo**: History of page organization changes
5. **Page Templates**: Quick creation of common page structures
6. **Search in Tree**: Filter pages within the sidebar
7. **Collapse/Expand**: Toggle visibility of page subtrees

## Troubleshooting

### Common Issues

1. **Drag-and-Drop Not Working**
   - Check browser console for Angular CDK errors
   - Verify DragDropModule is imported
   - Ensure cdkDropList and cdkDrag directives are present

2. **Pages Not Loading in Editor**
   - Check PageSelectionService subscription
   - Verify page ID is being passed correctly
   - Check network requests in browser dev tools

3. **Backend Compilation Errors**
   - Ensure all imports are correct
   - Check Maven dependencies
   - Verify Java version compatibility

4. **Database Issues**
   - Ensure MongoDB is running
   - Check connection string in application.properties
   - Verify database permissions

### Debug Mode
Enable debug logging in `application.properties`:
```properties
logging.level.com.clone.notion=DEBUG
logging.level.org.springframework.security=DEBUG
```

## Conclusion

The hierarchical pages implementation provides a solid foundation for a Notion-like page organization system. The drag-and-drop functionality works seamlessly with the backend, and the sidebar-editor integration creates a smooth user experience. The implementation is production-ready with proper error handling and performance considerations. 