# Backend Fixes for Frontend Compatibility

## Issues Fixed

### 1. **AuthTokenFilter Component Issue**
- **Problem**: `AuthTokenFilter` was missing `@Component` annotation, preventing Spring from managing it as a bean
- **Fix**: Added `@Component` annotation to `AuthTokenFilter` class
- **File**: `src/main/java/com/clone/notion/security/jwt/AuthTokenFilter.java`

### 2. **CORS Configuration**
- **Problem**: Inconsistent CORS origins across controllers and missing CORS configuration in security
- **Fixes**:
  - Added comprehensive CORS configuration in `WebSecurityConfig`
  - Standardized CORS annotations to `@CrossOrigin(origins = "*", maxAge = 3600)` across all controllers
  - Added CORS support for all HTTP methods and headers
- **Files**: 
  - `src/main/java/com/clone/notion/config/WebSecurityConfig.java`
  - `src/main/java/com/clone/notion/controller/PageController.java`
  - `src/main/java/com/clone/notion/controller/CollaborativeController.java`

### 3. **JWT Secret Configuration**
- **Problem**: JWT secret was not properly base64 encoded
- **Fix**: Updated JWT secret to be properly base64 encoded
- **File**: `src/main/resources/application.properties`

### 4. **Error Handling**
- **Problem**: Missing comprehensive error handling in controllers
- **Fixes**:
  - Added try-catch blocks to all controller methods
  - Created `GlobalExceptionHandler` for consistent error responses
  - Added proper HTTP status codes for different error scenarios
- **Files**:
  - `src/main/java/com/clone/notion/exception/GlobalExceptionHandler.java`
  - Updated all controller methods with error handling

### 5. **Database Initialization**
- **Problem**: No automatic initialization of required roles
- **Fix**: Created `DataInitializer` to automatically create required roles on startup
- **File**: `src/main/java/com/clone/notion/config/DataInitializer.java`

### 6. **Health Monitoring**
- **Problem**: No health check endpoint for monitoring
- **Fix**: Added `HealthController` with health check endpoint
- **File**: `src/main/java/com/clone/notion/controller/HealthController.java`

## Configuration Updates

### Application Properties
```properties
# Updated JWT secret (base64 encoded)
notion.app.jwtSecret=MjE2NzVld3N1eWlvYWFoZGkyMzFnNzgzb2lkd2Fram9kZHdhb2l1cHcxZ2Roby0yOTd1

# Added logging configuration
logging.level.com.clone.notion=DEBUG
logging.level.org.springframework.security=DEBUG

# Added Jackson configuration
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.time-zone=UTC
```

### Security Configuration
- Added CORS support with proper configuration
- Added health endpoint to permitted URLs
- Maintained JWT authentication for protected endpoints

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration

### Pages
- `GET /api/pages` - Get all pages for user
- `GET /api/pages/{id}` - Get specific page
- `POST /api/pages` - Create new page
- `PUT /api/pages/{id}` - Update page
- `DELETE /api/pages/{id}` - Delete page
- `GET /api/pages/search?query=term` - Search pages

### Collaborative Editing
- `POST /api/collaborative/pages/{pageId}/initialize` - Initialize collaborative editing
- `POST /api/collaborative/pages/{pageId}/sync-content` - Sync content from Convex
- `GET /api/collaborative/pages/{pageId}/status` - Get collaborative status
- `POST /api/collaborative/pages/{pageId}/disconnect` - Disconnect from Convex
- `GET /api/collaborative/pages/search?query=term` - Search collaborative pages
- `POST /api/collaborative/pages/{pageId}/merge` - Merge Convex changes

### Health Check
- `GET /api/health` - Application health status

## Running the Application

1. **Prerequisites**:
   - Java 21 or higher
   - MongoDB running on localhost:27017
   - Maven (optional, can use IDE)

2. **Start MongoDB**:
   ```bash
   # Start MongoDB service
   mongod
   ```

3. **Run the Application**:
   ```bash
   # Using Maven
   mvn spring-boot:run
   
   # Or using IDE
   # Run NotionApplication.java
   ```

4. **Verify**:
   - Health check: `GET http://localhost:8080/api/health`
   - Should return: `{"status":"UP","service":"Notion Clone Backend","timestamp":...}`

## Frontend Integration

The backend is now properly configured to handle requests from the Angular frontend:
- CORS is properly configured for cross-origin requests
- JWT authentication is working correctly
- All endpoints return proper HTTP status codes
- Error handling provides consistent responses
- Database initialization ensures required data exists

## Testing

1. **Health Check**: `GET http://localhost:8080/api/health`
2. **Register User**: `POST http://localhost:8080/api/auth/signup`
3. **Login**: `POST http://localhost:8080/api/auth/signin`
4. **Create Page**: `POST http://localhost:8080/api/pages` (with JWT token)

All endpoints should now work correctly with the frontend application.

# Bugfix Log

## 2024-06-16: Spring Boot 400 Bad Request on @PathVariable (Missing -parameters flag)
- **Symptom:** All GET endpoints with @PathVariable returned 400 Bad Request with message: "Name for argument of type [java.lang.String] not specified, and parameter name information not available via reflection. Ensure that the compiler uses the '-parameters' flag."
- **Root Cause:** Java compiler did not include method parameter names in bytecode, so Spring could not bind @PathVariable.
- **Solution:** Added `<arg>-parameters</arg>` to the `maven-compiler-plugin` in `pom.xml`.
- **Result:** All endpoints now work as expected.

## 2024-06-16: Hierarchical Pages Implementation with Drag-and-Drop Support
- **Feature:** Added support for hierarchical page organization with parent-child relationships and sibling ordering.
- **Changes:**
  - Added `order` field to `Page` model for sibling ordering within the same parent.
  - Added `MovePageRequest` class for page move operations.
  - Added `movePage()` and `updateOrder()` methods to `PageService` with automatic sibling reordering.
  - Added `PUT /api/pages/{id}/move` and `PUT /api/pages/{id}/order` endpoints.
  - Updated repository to return pages ordered by `parentId` and `order`.
  - Frontend sidebar now supports drag-and-drop with backend persistence.
- **Result:** Users can now organize pages hierarchically and reorder them via drag-and-drop. 