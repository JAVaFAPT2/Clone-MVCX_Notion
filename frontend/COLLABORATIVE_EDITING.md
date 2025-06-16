# Collaborative Editing with Presence & Comments

This document describes the collaborative editing features implemented in the Notion clone, including real-time collaboration, user presence tracking, and comments functionality.

## Overview

The collaborative editing system uses:
- **Yjs**: CRDT (Conflict-free Replicated Data Type) for real-time collaboration
- **TipTap**: Rich text editor with collaboration extensions
- **y-websocket**: WebSocket server for real-time synchronization
- **Angular Services**: Presence and comments management

## Features

### 1. Real-time Collaborative Editing
- Multiple users can edit the same document simultaneously
- Automatic conflict resolution using CRDT
- Real-time synchronization across all connected clients
- Automatic sync to backend database

### 2. User Presence
- Shows who is currently editing the document
- Real-time cursor position tracking
- Online/offline status indicators
- User activity timestamps

### 3. Comments System
- Add comments to specific parts of the document
- Reply to comments
- Resolve comments when issues are addressed
- Delete comments
- Threaded comment discussions

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular App   │    │  y-websocket    │    │  Spring Boot    │
│                 │    │     Server      │    │    Backend      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ Collaborative   │◄──►│ WebSocket       │    │ Collaborative   │
│ Editor          │    │ Connection      │    │ Controller      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ Presence        │◄──►│ Yjs Document    │    │ Presence API    │
│ Service         │    │ Sync            │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ Comments        │◄──►│ Real-time       │    │ Comments API    │
│ Service         │    │ Updates         │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components

### 1. CollaborativeEditorComponent
Main component that integrates all collaborative features.

**Features:**
- TipTap editor with Yjs collaboration
- Real-time cursor tracking
- Automatic backend synchronization
- Presence and comments integration

**Usage:**
```typescript
<app-collaborative-editor
  [pageId]="pageId"
  [convexDocId]="convexDocId"
  [username]="currentUsername"
  [userId]="currentUserId">
</app-collaborative-editor>
```

### 2. PresenceComponent
Displays online users and their cursor positions.

**Features:**
- Real-time user presence updates
- Cursor position visualization
- Online/offline status
- User activity tracking

### 3. CommentsComponent
Manages comments and replies.

**Features:**
- Add new comments
- Reply to existing comments
- Resolve comments
- Delete comments
- Threaded discussions

## Services

### 1. PresenceService
Manages user presence information.

**Methods:**
- `initializePresence(pageId, userId, username, color)`: Start presence tracking
- `updateCursor(cursor)`: Update cursor position
- `updateSelection(selection)`: Update text selection
- `getPresence()`: Get current presence data
- `disconnect()`: Clean up presence tracking

### 2. CommentsService
Manages comments functionality.

**Methods:**
- `initializeComments(pageId)`: Start comments for a page
- `addComment(content, blockId?)`: Add new comment
- `addReply(parentCommentId, content)`: Add reply to comment
- `resolveComment(commentId)`: Mark comment as resolved
- `deleteComment(commentId)`: Delete a comment
- `getComments()`: Get all comments

## Backend API Endpoints

### Presence Endpoints
```
POST /api/collaborative/pages/{pageId}/presence
GET  /api/collaborative/pages/{pageId}/presence
```

### Comments Endpoints
```
POST   /api/collaborative/pages/{pageId}/comments
GET    /api/collaborative/pages/{pageId}/comments
POST   /api/collaborative/pages/{pageId}/comments/{commentId}/replies
PUT    /api/collaborative/pages/{pageId}/comments/{commentId}/resolve
DELETE /api/collaborative/pages/{pageId}/comments/{commentId}
```

### Collaborative Editing Endpoints
```
POST /api/collaborative/pages/{pageId}/initialize
POST /api/collaborative/pages/{pageId}/sync-content
GET  /api/collaborative/pages/{pageId}/status
POST /api/collaborative/pages/{pageId}/disconnect
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install @tiptap/core @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor @tiptap/pm yjs y-websocket @tiptap/starter-kit
```

### 2. Start y-websocket Server
```bash
npx y-websocket-server --port 1234
```

### 3. Configure Backend
Ensure your Spring Boot backend has the collaborative endpoints configured.

### 4. Use the Components
```typescript
// In your component
import { CollaborativeEditorComponent } from './components/collaborative-editor/collaborative-editor.component';

@Component({
  imports: [CollaborativeEditorComponent],
  template: `
    <app-collaborative-editor
      [pageId]="'my-page-id'"
      [username]="'Current User'"
      [userId]="'user-123'">
    </app-collaborative-editor>
  `
})
```

## Testing

### 1. Multi-user Testing
1. Open the collaborative editor in multiple browser tabs
2. Start typing in different tabs
3. Observe real-time synchronization
4. Check presence indicators
5. Add comments and test replies

### 2. Network Testing
1. Test with slow network connections
2. Verify conflict resolution works
3. Check automatic reconnection
4. Test offline/online scenarios

### 3. Performance Testing
1. Monitor memory usage with multiple users
2. Check WebSocket connection stability
3. Verify backend sync performance
4. Test with large documents

## Configuration

### Environment Variables
```typescript
// environment.ts
export const environment = {
  production: false,
  websocketUrl: 'ws://localhost:1234',
  apiUrl: 'http://localhost:8080/api'
};
```

### TipTap Configuration
```typescript
const editor = new Editor({
  extensions: [
    StarterKit,
    Collaboration.configure({ document: ydoc }),
    CollaborationCursor.configure({
      provider: provider,
      user: { name: username, color: '#007bff' }
    })
  ],
  content: '',
  autofocus: true
});
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Ensure y-websocket server is running
   - Check firewall settings
   - Verify WebSocket URL configuration

2. **Presence Not Updating**
   - Check authentication token
   - Verify user ID and username are set
   - Check network connectivity

3. **Comments Not Loading**
   - Verify page ID is correct
   - Check backend API endpoints
   - Ensure user has proper permissions

4. **Sync Issues**
   - Check backend connectivity
   - Verify CRDT document state
   - Monitor WebSocket connection

### Debug Mode
Enable debug logging in the services:
```typescript
// In presence.service.ts or comments.service.ts
console.log('[DEBUG] Presence update:', presenceData);
```

## Performance Considerations

1. **Debouncing**: Presence updates are debounced to reduce API calls
2. **Connection Management**: Automatic reconnection on network issues
3. **Memory Management**: Proper cleanup on component destruction
4. **Optimistic Updates**: UI updates immediately, syncs in background

## Security

1. **Authentication**: All API calls require valid JWT tokens
2. **Authorization**: Users can only access their own pages
3. **Input Validation**: All user inputs are validated
4. **Rate Limiting**: Consider implementing rate limiting for presence updates

## Future Enhancements

1. **Real-time Notifications**: Push notifications for comments and mentions
2. **Version History**: Track document changes over time
3. **Conflict Resolution UI**: Visual conflict resolution interface
4. **Offline Support**: Work offline with sync when reconnected
5. **Rich Comments**: Support for rich text in comments
6. **Mentions**: @mentions in comments and content
7. **Permissions**: Granular permissions for different users
8. **Analytics**: Track collaboration metrics

## Conclusion

The collaborative editing system provides a robust foundation for real-time collaboration with presence tracking and comments. The modular architecture allows for easy extension and customization based on specific requirements. 