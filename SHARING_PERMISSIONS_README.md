# Sharing and Permissions Feature

## Overview

The Sharing and Permissions feature provides comprehensive page sharing capabilities with granular permission controls, supporting both user-specific shares and public links with expiration dates.

## Features

### Core Sharing
- **User-specific sharing**: Share pages with specific users by email
- **Public link sharing**: Create shareable links for public access
- **Permission levels**: Four distinct permission levels (View, Comment, Edit, Admin)
- **Expiration dates**: Set expiration dates for public shares
- **Share management**: Easily manage and revoke shares

### Permission System
- **VIEW**: Can view the page content
- **COMMENT**: Can view and add comments
- **EDIT**: Can view, comment, and edit the page
- **ADMIN**: Full access including sharing and deletion

### Advanced Features
- **Access control**: Real-time permission checking
- **Share tracking**: Track all shares for pages and users
- **Automatic cleanup**: Expired shares are automatically deactivated
- **Share analytics**: View sharing statistics and history

## Backend Implementation

### Models

#### PageShare Model
```java
public class PageShare {
    private String id;
    private String pageId;
    private String sharedByUserId; // User who shared the page
    private String sharedWithUserId; // User with whom the page is shared
    private String permission; // "view", "edit", "comment", "admin"
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant expiresAt; // Optional expiration date
    private String shareLink; // Optional public share link
    private boolean isPublic; // Whether this is a public share
}
```

#### Permission Enum
```java
public enum Permission {
    VIEW("view", "Can view the page"),
    COMMENT("comment", "Can view and add comments"),
    EDIT("edit", "Can view, comment, and edit the page"),
    ADMIN("admin", "Full access including sharing and deletion");
}
```

### API Endpoints

#### Share Page with User
```http
POST /api/shares/page/{pageId}/share
Content-Type: application/json

{
  "userId": "user-email@example.com",
  "permission": "EDIT"
}
```

#### Create Public Share
```http
POST /api/shares/page/{pageId}/public
Content-Type: application/json

{
  "permission": "VIEW",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

#### Get Shares for Page
```http
GET /api/shares/page/{pageId}
```

#### Get Shares by User
```http
GET /api/shares/by-user
```

#### Get Shares with User
```http
GET /api/shares/with-user
```

#### Get Share by Link
```http
GET /api/shares/link/{shareLink}
```

#### Check Access
```http
POST /api/shares/page/{pageId}/access
Content-Type: application/json

{
  "permission": "EDIT"
}
```

#### Revoke Share
```http
DELETE /api/shares/page/{pageId}/user/{userId}
```

#### Revoke Public Share
```http
DELETE /api/shares/page/{pageId}/public
```

#### Update Share Permission
```http
PUT /api/shares/page/{pageId}/user/{userId}/permission
Content-Type: application/json

{
  "permission": "COMMENT"
}
```

#### Get Available Permissions
```http
GET /api/shares/permissions
```

#### Cleanup Expired Shares
```http
POST /api/shares/cleanup
```

### Services

#### PageShareService
- **sharePageWithUser()**: Share page with specific user
- **createPublicShare()**: Create public share link
- **hasAccess()**: Check if user has required permission
- **revokeShare()**: Revoke user-specific share
- **revokePublicShare()**: Revoke public share
- **updateSharePermission()**: Update permission level
- **cleanupExpiredShares()**: Remove expired shares

## Frontend Implementation

### Services

#### PageShareService
```typescript
export interface PageShare {
  id: string;
  pageId: string;
  sharedByUserId: string;
  sharedWithUserId?: string;
  permission: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  shareLink?: string;
  isPublic: boolean;
}

export interface Permission {
  value: string;
  description: string;
}
```

**Key Methods:**
- `initializeShares(pageId)`: Load shares for a page
- `sharePageWithUser(userId, permission)`: Share with specific user
- `createPublicShare(permission, expiresAt?)`: Create public share
- `checkAccess(permission)`: Check user access
- `revokeShare(userId)`: Revoke user share
- `revokePublicShare()`: Revoke public share
- `updateSharePermission(userId, permission)`: Update permission
- `getAvailablePermissions()`: Get permission options

### Components

#### PageShareComponent
**Features:**
- Modal-based sharing interface
- User-specific sharing with email input
- Public link creation with expiration
- Permission level selection
- Share management and revocation
- Copy share links to clipboard
- Share statistics display

**UI Elements:**
- Share button and modal
- User email input with permission dropdown
- Public share creation with expiration options
- Current shares list with permission management
- Public links list with copy functionality
- Share summary with statistics

## Usage Examples

### Sharing a Page with a User
```typescript
// In a component
this.pageShareService.sharePageWithUser('user@example.com', 'EDIT').subscribe(share => {
  console.log('Page shared:', share);
});
```

### Creating a Public Share
```typescript
const expirationDate = new Date();
expirationDate.setDate(expirationDate.getDate() + 7); // 7 days from now

this.pageShareService.createPublicShare('VIEW', expirationDate.toISOString()).subscribe(share => {
  console.log('Public share created:', share);
});
```

### Checking User Access
```typescript
this.pageShareService.checkAccess('EDIT').subscribe(hasAccess => {
  if (hasAccess) {
    console.log('User can edit the page');
  } else {
    console.log('User cannot edit the page');
  }
});
```

### Using the Share Component
```html
<app-page-share [pageId]="currentPageId"></app-page-share>
```

## Database Schema

### Page Shares Collection
```javascript
{
  "_id": "share-id",
  "pageId": "page-id",
  "sharedByUserId": "owner-user-id",
  "sharedWithUserId": "shared-with-user-id", // null for public shares
  "permission": "edit",
  "active": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "expiresAt": "2024-12-31T23:59:59Z", // optional
  "shareLink": "share_abc123def456", // for public shares
  "isPublic": false
}
```

## Security Features

### Authorization
- Users can only share pages they own or have admin access to
- Permission inheritance (higher permissions include lower ones)
- Share revocation requires ownership or admin access

### Access Control
- Real-time permission checking for all page operations
- Expired shares are automatically deactivated
- Public shares can be revoked at any time

### Input Validation
- Email format validation for user shares
- Permission level validation
- Expiration date validation

## Performance Considerations

### Database Indexes
```javascript
// Recommended indexes
db.page_shares.createIndex({ "pageId": 1, "active": 1 })
db.page_shares.createIndex({ "sharedWithUserId": 1, "active": 1 })
db.page_shares.createIndex({ "sharedByUserId": 1, "active": 1 })
db.page_shares.createIndex({ "shareLink": 1, "active": 1 })
db.page_shares.createIndex({ "expiresAt": 1, "active": 1 })
```

### Caching
- Permission checks cached per user/page combination
- Share lists cached at page level
- Public share links cached in memory

## Testing

### Backend Tests
```java
@Test
public void testSharePageWithUser() {
    PageShare share = pageShareService.sharePageWithUser(pageId, ownerId, userId, "EDIT");
    
    assertNotNull(share);
    assertEquals("EDIT", share.getPermission());
    assertTrue(share.isActive());
}

@Test
public void testHasAccess() {
    // Setup share
    pageShareService.sharePageWithUser(pageId, ownerId, userId, "EDIT");
    
    // Test access
    assertTrue(pageShareService.hasAccess(pageId, userId, "VIEW"));
    assertTrue(pageShareService.hasAccess(pageId, userId, "EDIT"));
    assertFalse(pageShareService.hasAccess(pageId, userId, "ADMIN"));
}
```

### Frontend Tests
```typescript
describe('PageShareService', () => {
  it('should share page with user', () => {
    service.sharePageWithUser('user@example.com', 'EDIT').subscribe(share => {
      expect(share.permission).toBe('EDIT');
      expect(share.sharedWithUserId).toBe('user@example.com');
    });
  });

  it('should check access correctly', () => {
    service.checkAccess('EDIT').subscribe(hasAccess => {
      expect(hasAccess).toBeDefined();
    });
  });
});
```

## Integration Points

### With Other Features
- **Comments**: Respects comment permissions
- **Templates**: Templates can be shared with specific permissions
- **Search**: Shared pages appear in search results for authorized users
- **Notifications**: Share notifications sent to users

### External Integrations
- **Email**: Share notifications via email
- **Slack/Discord**: Webhook notifications for shares
- **Analytics**: Share activity tracking

## Future Enhancements

### Planned Features
1. **Team sharing**: Share with entire teams or groups
2. **Advanced permissions**: Custom permission combinations
3. **Share analytics**: Detailed sharing statistics
4. **Bulk sharing**: Share multiple pages at once
5. **Share templates**: Predefined sharing configurations
6. **Audit logs**: Complete sharing history and audit trail

### Advanced Sharing
1. **Conditional sharing**: Share based on user roles or conditions
2. **Time-limited access**: Temporary access grants
3. **Watermarking**: Add watermarks for shared content
4. **Download restrictions**: Control file downloads
5. **Share expiration notifications**: Alert before shares expire

## Troubleshooting

### Common Issues

1. **Shares not working**
   - Check user exists in database
   - Verify permission format
   - Check share expiration dates

2. **Access denied errors**
   - Verify user has required permission
   - Check if share is still active
   - Review share expiration

3. **Public links not accessible**
   - Check if public share is active
   - Verify share link format
   - Check expiration date

### Debug Mode
Enable debug logging in `application.properties`:
```properties
logging.level.com.clone.notion.service.PageShareService=DEBUG
```

## Best Practices

### Security
- Always validate permissions before allowing access
- Use HTTPS for all share links
- Implement rate limiting for share creation
- Log all share activities for audit

### Performance
- Cache permission checks where possible
- Use database indexes for frequent queries
- Implement pagination for large share lists
- Clean up expired shares regularly

### User Experience
- Provide clear permission descriptions
- Show share status and expiration clearly
- Offer easy share management interface
- Implement share link copying functionality

## Conclusion

The Sharing and Permissions feature provides a robust and flexible system for page sharing with granular access controls. The implementation supports both user-specific and public sharing with comprehensive permission management, making it suitable for collaborative environments while maintaining security and performance. 