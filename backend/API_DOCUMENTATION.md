# Notion Clone Backend API Documentation

## Overview
This document describes the API endpoints for the Notion Clone backend, including the new collaborative editing features integrated with Convex.

## Base URL
```
http://localhost:8080/api
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Page Management Endpoints

### Get All Pages
```
GET /pages
```
Returns all pages for the authenticated user.

**Response:**
```json
[
  {
    "id": "page-id",
    "userId": "user-id",
    "title": "Page Title",
    "icon": "📄",
    "convexDocId": "convex_doc_123",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Get Page by ID
```
GET /pages/{id}
```
Returns a specific page by ID.

### Create Page
```
POST /pages
```
Creates a new page.

**Request Body:**
```json
{
  "title": "New Page",
  "icon": "📄",
  "parentId": "parent-page-id",
  "blocks": []
}
```

### Update Page
```
PUT /pages/{id}
```
Updates an existing page.

### Delete Page
```
DELETE /pages/{id}
```
Deletes a page.

## Collaborative Editing Endpoints

### Initialize Collaborative Page
```
POST /collaborative/pages/{pageId}/initialize
```
Initializes collaborative editing for a page by creating a Convex document.

**Response:**
```json
{
  "convexDocId": "convex_doc_page-id_1234567890",
  "pageId": "page-id"
}
```

### Sync Content from Convex
```
POST /collaborative/pages/{pageId}/sync-content
```
Syncs content from Convex back to the backend database.

**Request Body:**
```json
{
  "title": "Updated Title",
  "blocks": [
    {
      "type": "paragraph",
      "content": "Updated content"
    }
  ]
}
```

### Get Collaborative Status
```
GET /collaborative/pages/{pageId}/status
```
Returns the collaborative editing status of a page.

**Response:**
```json
{
  "pageId": "page-id",
  "convexDocId": "convex_doc_123",
  "hasCollaborativeEditing": true,
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

### Disconnect from Convex
```
POST /collaborative/pages/{pageId}/disconnect
```
Disconnects a page from collaborative editing.

### Search Collaborative Pages
```
GET /collaborative/pages/search?query=search-term
```
Searches for collaborative pages by title or content.

### Merge Convex Changes
```
POST /collaborative/pages/{pageId}/merge
```
Merges changes from Convex with conflict resolution.

**Request Body:**
```json
{
  "title": "Merged Title",
  "blocks": [],
  "resolution": "convex"
}
```

## Page-Specific Endpoints

### Update Convex Document ID
```
PUT /pages/{id}/convex-doc
```
Updates the Convex document ID for a page.

**Request Body:**
```json
"convex_doc_123"
```

### Get Convex Document ID
```
GET /pages/{id}/convex-doc
```
Returns the Convex document ID for a page.

### Update Page Title
```
PUT /pages/{id}/title
```
Updates only the title of a page.

**Request Body:**
```json
"New Title"
```

### Update Page Icon
```
PUT /pages/{id}/icon
```
Updates only the icon of a page.

**Request Body:**
```json
"📄"
```

### Search Pages
```
GET /pages/search?query=search-term
```
Searches for pages by title or content.

## Authentication Endpoints

### Sign In
```
POST /auth/signin
```
Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "type": "Bearer",
  "id": "user-id",
  "username": "username",
  "email": "user@example.com",
  "roles": ["ROLE_USER"]
}
```

### Sign Up
```
POST /auth/signup
```
Registers a new user.

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password",
  "role": ["user"]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Error description"
}
```

### 401 Unauthorized
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/pages"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

## Data Models

### Page
```json
{
  "id": "string",
  "userId": "string",
  "parentId": "string",
  "icon": "string",
  "title": "string",
  "blocks": [
    {
      "type": "string",
      "content": "string"
    }
  ],
  "convexDocId": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Block
```json
{
  "type": "string",
  "content": "string"
}
```

## Configuration

The following properties can be configured in `application.properties`:

```properties
# Convex configuration
convex.api.url=https://api.convex.cloud
convex.deployment.url=
convex.auth.token=

# Collaborative editing settings
collaborative.enabled=true
collaborative.sync.interval=5000
collaborative.presence.enabled=true
```

## Usage Examples

### Initialize Collaborative Editing
1. Create a page using `POST /pages`
2. Initialize collaborative editing using `POST /collaborative/pages/{pageId}/initialize`
3. Use the returned `convexDocId` in the frontend Convex integration

### Sync Changes
1. Make changes in the collaborative editor
2. Periodically sync using `POST /collaborative/pages/{pageId}/sync-content`
3. Handle conflicts using `POST /collaborative/pages/{pageId}/merge`

### Search and Filter
1. Search all pages using `GET /pages/search?query=term`
2. Search only collaborative pages using `GET /collaborative/pages/search?query=term`
3. Get collaborative status using `GET /collaborative/pages/{pageId}/status` 