# Cookie and LocalStorage Support Guide

## Overview

This guide explains the cookie and localStorage support implemented in the Notion Clone application, including authentication, preferences, and collaborative features.

## Cookie Support

### Authentication Cookies

**Purpose**: Secure, HTTP-only cookies for authentication tokens
**Configuration**: `CookieConfig.java`

```java
// Cookie settings
AUTH_COOKIE_NAME = "notion_token"
COOKIE_MAX_AGE = 86400 // 24 hours
HTTP_ONLY = true
SECURE = false // Set to true in production with HTTPS
```

**Usage**:
- Automatically set during login via `AuthController`
- Checked by `AuthTokenFilter` for authentication
- Cleared during logout

### Preference Cookies

**Purpose**: User preferences and settings
**Configuration**: 
```java
PREFERENCE_COOKIE_NAME = "notion_preferences"
HTTP_ONLY = false // Allow JavaScript access
```

**Usage**:
- Store user preferences (theme, layout, etc.)
- Accessible via JavaScript for dynamic updates
- Managed through `/api/auth/preferences` endpoints

## LocalStorage Support

### Server-Side LocalStorage

**Purpose**: Temporary data storage with automatic cleanup
**Implementation**: `LocalStorageService.java`

**Features**:
- User-specific storage with automatic expiration
- Automatic cleanup of expired items (every 5 minutes)
- Thread-safe concurrent access

**Usage**:
```java
// Store data with default 1-hour expiry
localStorageService.setUserItem(userId, "key", "value");

// Store data with custom expiry
localStorageService.setUserItem(userId, "key", "value", 3600);

// Retrieve data
String value = localStorageService.getUserItem(userId, "key");

// Remove data
localStorageService.removeUserItem(userId, "key");
```

### REST API for LocalStorage

**Endpoints**:
- `POST /api/storage/set` - Store item
- `GET /api/storage/get/{key}` - Retrieve item
- `DELETE /api/storage/remove/{key}` - Remove item
- `DELETE /api/storage/clear` - Clear all user items
- `GET /api/storage/has/{key}` - Check if item exists

## Collaborative Features

### Enhanced Collaborative Editing

**New Endpoints**:

1. **Presence Tracking**
   - `POST /api/collaborative/pages/{pageId}/presence` - Update user presence
   - `GET /api/collaborative/pages/{pageId}/presence` - Get all users' presence

2. **Comments System**
   - `POST /api/collaborative/pages/{pageId}/comments` - Add comment
   - `GET /api/collaborative/pages/{pageId}/comments` - Get comments

3. **Page Sharing**
   - `POST /api/collaborative/pages/{pageId}/share` - Share page with users

4. **Version History**
   - `GET /api/collaborative/pages/{pageId}/version-history` - Get page versions

### Real-time Collaboration

**Features**:
- User presence indicators
- Cursor and selection tracking
- Comment system for collaboration
- Page sharing with permissions
- Version history tracking
- Conflict resolution strategies

## Frontend Integration

### Authentication Flow

1. **Login**: 
   - Sends credentials to `/api/auth/signin`
   - Receives JWT token in response body
   - Cookie automatically set by server
   - Token also stored in localStorage as backup

2. **Authentication Check**:
   - `AuthTokenFilter` checks both Authorization header and cookies
   - Prioritizes header, falls back to cookie

3. **Logout**:
   - Calls `/api/auth/signout` to clear server-side cookie
   - Removes localStorage token
   - Redirects to login page

### Workspace Component

**Features**:
- Modern Notion-like interface
- Sidebar with page navigation
- User authentication status
- Page creation and management
- Responsive design

**Routing**:
- Login redirects to `/workspace`
- Protected by `AuthGuard`
- Handles authentication state

## Security Considerations

### Cookie Security

1. **HTTP-Only**: Authentication cookies are HTTP-only to prevent XSS attacks
2. **Secure Flag**: Set to true in production with HTTPS
3. **SameSite**: Set to "Strict" to prevent CSRF attacks
4. **Expiration**: 24-hour expiration for security

### LocalStorage Security

1. **User Isolation**: Each user's data is isolated
2. **Automatic Cleanup**: Expired data is automatically removed
3. **Server-Side Validation**: All access is validated through authentication

## Usage Examples

### Setting User Preferences

```typescript
// Frontend
this.authService.setPreferences({
  theme: 'dark',
  sidebarCollapsed: false,
  fontSize: 'medium'
}).subscribe(response => {
  console.log('Preferences saved');
});
```

### Storing Temporary Data

```typescript
// Frontend
this.authService.setStorageItem('draft_content', JSON.stringify(content))
  .subscribe(response => {
    console.log('Draft saved');
  });
```

### Collaborative Presence

```typescript
// Frontend
this.http.post(`/api/collaborative/pages/${pageId}/presence`, {
  cursor: { x: 100, y: 200 },
  selection: { start: 0, end: 10 }
}).subscribe(response => {
  console.log('Presence updated');
});
```

## Configuration

### Backend Configuration

```properties
# application.properties
# Cookie settings
cookie.auth.name=notion_token
cookie.preferences.name=notion_preferences
cookie.max-age=86400
cookie.secure=false
cookie.http-only=true

# LocalStorage settings
localstorage.cleanup.interval=300
localstorage.default.expiry=3600
```

### Frontend Configuration

```typescript
// Angular environment
export const environment = {
  apiUrl: 'http://localhost:8080/api',
  withCredentials: true, // Enable cookies
  localStoragePrefix: 'notion_'
};
```

## Best Practices

1. **Use cookies for authentication** - More secure than localStorage
2. **Use localStorage for temporary data** - Faster access, automatic cleanup
3. **Validate all server-side data** - Never trust client-side data
4. **Implement proper error handling** - Handle network failures gracefully
5. **Use HTTPS in production** - Enable secure cookies
6. **Regular cleanup** - Monitor and clean up expired data

## Troubleshooting

### Common Issues

1. **Cookies not working**:
   - Check `withCredentials: true` in HTTP requests
   - Verify CORS configuration allows credentials
   - Ensure HTTPS in production

2. **LocalStorage not persisting**:
   - Check user authentication
   - Verify key naming conventions
   - Monitor cleanup intervals

3. **Collaborative features not working**:
   - Verify Convex/Yjs integration
   - Check presence tracking configuration
   - Monitor real-time connection status

### Debug Tips

1. **Check browser developer tools**:
   - Application tab for cookies and localStorage
   - Network tab for API requests
   - Console for errors

2. **Server logs**:
   - Monitor authentication attempts
   - Check cookie operations
   - Verify storage operations

3. **Database monitoring**:
   - Check user sessions
   - Monitor page access patterns
   - Verify collaborative data integrity 