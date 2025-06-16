# Comments and Mentions Feature

## Overview

The Comments and Mentions feature provides a comprehensive commenting system with @mentions functionality, allowing users to collaborate effectively on pages and specific content blocks.

## Features

### Core Commenting
- **Page-level comments**: Add comments to entire pages
- **Block-level comments**: Add comments to specific content blocks
- **Threaded replies**: Reply to comments with nested conversation threads
- **Comment resolution**: Mark comments as resolved when addressed
- **Comment deletion**: Remove comments (with proper authorization)

### Mentions System
- **@mentions**: Mention users using @username syntax
- **Real-time suggestions**: Auto-complete user suggestions while typing
- **Keyboard navigation**: Arrow keys to navigate suggestions, Enter to select
- **Mention validation**: Validate mentioned users exist before posting
- **Mention highlighting**: Visual highlighting of mentions in comments
- **Mention tracking**: Track all comments that mention a specific user

### Enhanced UI
- **Comment statistics**: Show total comments and unresolved count
- **Timestamps**: Relative time display (e.g., "2h ago", "3m ago")
- **Visual indicators**: Badges for mentions, resolved status
- **Responsive design**: Works on desktop and mobile devices

## Backend Implementation

### Models

#### Comment Model
```java
public class Comment {
    private String id;
    private String pageId;
    private String userId;
    private String username;
    private String content;
    private String blockId; // Optional: for block-specific comments
    private String parentCommentId; // For replies
    private List<String> mentions; // List of mentioned user IDs
    private boolean resolved;
    private Instant createdAt;
    private Instant updatedAt;
    private List<Comment> replies; // Nested replies
}
```

### API Endpoints

#### Get Comments
```http
GET /api/comments/page/{pageId}
```
Returns all comments for a page with nested replies.

#### Get Block Comments
```http
GET /api/comments/page/{pageId}/block/{blockId}
```
Returns comments for a specific block.

#### Create Comment
```http
POST /api/comments/page/{pageId}
Content-Type: application/json

{
  "content": "This is a comment with @username mention",
  "blockId": "optional-block-id"
}
```

#### Create Reply
```http
POST /api/comments/{commentId}/replies
Content-Type: application/json

{
  "content": "This is a reply with @another_user mention"
}
```

#### Resolve Comment
```http
PUT /api/comments/{commentId}/resolve
```

#### Delete Comment
```http
DELETE /api/comments/{commentId}
```

#### Get User Mentions
```http
GET /api/comments/mentions
```
Returns all comments that mention the current user.

#### Get Unresolved Comments
```http
GET /api/comments/page/{pageId}/unresolved
```

#### Get Comment Count
```http
GET /api/comments/page/{pageId}/count
```

#### Validate Mentions
```http
POST /api/comments/validate-mentions
Content-Type: application/json

{
  "content": "Comment with @username mention"
}
```

### Services

#### CommentService
- **createComment()**: Create new comments with mention extraction
- **createReply()**: Create replies to existing comments
- **resolveComment()**: Mark comments as resolved
- **deleteComment()**: Delete comments with authorization check
- **extractMentions()**: Parse @mentions from comment content
- **validateMentions()**: Verify mentioned users exist

## Frontend Implementation

### Services

#### CommentsService
```typescript
export interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
  blockId?: string;
  pageId: string;
  parentCommentId?: string;
  mentions?: string[];
  resolved?: boolean;
  replies?: Comment[];
  createdAt?: string;
  updatedAt?: string;
}
```

**Key Methods:**
- `initializeComments(pageId)`: Load comments for a page
- `addComment(content, blockId?)`: Create new comment
- `addReply(parentCommentId, content)`: Create reply
- `resolveComment(commentId)`: Mark as resolved
- `deleteComment(commentId)`: Delete comment
- `getMentionsForUser()`: Get mentions for current user
- `validateMentions(content)`: Validate mentions
- `extractMentions(content)`: Extract mentions from text
- `formatContentWithMentions(content)`: Format with HTML highlighting

### Components

#### EnhancedCommentsComponent
**Features:**
- Real-time comment display
- Add/edit/delete comments
- Threaded replies
- @mentions with auto-complete
- Keyboard navigation
- Comment resolution
- Statistics display

**Mentions Functionality:**
- Auto-suggestions while typing @
- Arrow key navigation
- Enter to select
- Escape to close
- Visual highlighting of mentions

## Usage Examples

### Adding a Comment with Mentions
```typescript
// In a component
this.commentsService.addComment(
  "Great work on this section! @john_doe can you review the implementation?",
  "block-123"
).subscribe(comment => {
  console.log('Comment added:', comment);
});
```

### Getting User Mentions
```typescript
this.commentsService.getMentionsForUser().subscribe(mentions => {
  console.log('Comments mentioning you:', mentions);
});
```

### Using the Enhanced Component
```html
<app-enhanced-comments [pageId]="currentPageId"></app-enhanced-comments>
```

## Database Schema

### Comments Collection
```javascript
{
  "_id": "comment-id",
  "pageId": "page-id",
  "userId": "user-id",
  "username": "username",
  "content": "Comment content with @mentions",
  "blockId": "optional-block-id",
  "parentCommentId": "parent-comment-id", // null for top-level
  "mentions": ["user-id-1", "user-id-2"],
  "resolved": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Security Features

### Authorization
- Users can only delete their own comments
- Comments are tied to page ownership
- Mention validation prevents invalid users

### Input Validation
- Content length limits
- Mention format validation
- XSS prevention through proper escaping

## Performance Considerations

### Database Indexes
```javascript
// Recommended indexes
db.comments.createIndex({ "pageId": 1, "createdAt": -1 })
db.comments.createIndex({ "mentions": 1 })
db.comments.createIndex({ "userId": 1, "createdAt": -1 })
db.comments.createIndex({ "parentCommentId": 1 })
```

### Caching
- Comment counts cached at page level
- User mention lists cached per user
- Recent comments cached in memory

## Testing

### Backend Tests
```java
@Test
public void testCreateCommentWithMentions() {
    String content = "Great work @john_doe!";
    Comment comment = commentService.createComment(pageId, userId, username, content, null);
    
    assertNotNull(comment);
    assertTrue(comment.getMentions().contains("john_doe-id"));
}

@Test
public void testValidateMentions() {
    assertTrue(commentService.validateMentions("Valid @existing_user"));
    assertFalse(commentService.validateMentions("Invalid @nonexistent_user"));
}
```

### Frontend Tests
```typescript
describe('CommentsService', () => {
  it('should extract mentions from content', () => {
    const content = 'Hello @john_doe and @jane_smith!';
    const mentions = service.extractMentions(content);
    expect(mentions).toEqual(['john_doe', 'jane_smith']);
  });
});
```

## Future Enhancements

### Planned Features
1. **Email notifications** for mentions
2. **Comment reactions** (like, heart, etc.)
3. **Comment editing** with history
4. **Bulk comment operations**
5. **Comment search and filtering**
6. **Rich text formatting** in comments
7. **File attachments** in comments
8. **Comment templates** for common responses

### Advanced Mentions
1. **Role-based mentions** (@admin, @moderator)
2. **Group mentions** (@team, @everyone)
3. **Mention suggestions** based on page collaborators
4. **Mention analytics** and reporting

## Integration Points

### With Other Features
- **Sharing/Permissions**: Comments respect page sharing settings
- **Templates**: Comment templates for common scenarios
- **Search**: Comments included in page search results
- **Notifications**: Mention notifications in notification system

### External Integrations
- **Email**: Mention notifications via email
- **Slack/Discord**: Webhook notifications for mentions
- **Analytics**: Comment activity tracking

## Troubleshooting

### Common Issues

1. **Mentions not working**
   - Check user exists in database
   - Verify mention format (@username)
   - Check mention validation endpoint

2. **Comments not loading**
   - Verify page ID is correct
   - Check user permissions
   - Review network requests

3. **Auto-complete not showing**
   - Check user list is populated
   - Verify keyboard event handling
   - Check CSS z-index for dropdown

### Debug Mode
Enable debug logging in `application.properties`:
```properties
logging.level.com.clone.notion.service.CommentService=DEBUG
```

## Conclusion

The Comments and Mentions feature provides a robust foundation for collaborative commenting with advanced mention functionality. The implementation is scalable, secure, and user-friendly, supporting both simple comments and complex threaded discussions with user mentions. 