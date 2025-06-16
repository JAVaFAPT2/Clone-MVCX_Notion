# Quick Start Guide - Hierarchical Pages with Drag-and-Drop

## 🚀 Quick Setup & Testing

### Prerequisites
- **Backend**: Java 21+, MongoDB running on localhost:27017
- **Frontend**: Node.js 22+, Angular CLI
- **Database**: MongoDB (install and start)

### Step 1: Start MongoDB
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### Step 2: Start Backend
```bash
cd backend

# Option A: Using IDE (IntelliJ, Eclipse, VS Code)
# Run NotionApplication.java

# Option B: Using Maven (if installed)
mvn spring-boot:run

# Option C: Using Java directly
java -jar target/notion-backend-0.0.1-SNAPSHOT.jar
```

**Verify Backend**: Visit `http://localhost:8080/api/health`

### Step 3: Start Frontend
```bash
cd frontend
npm install
ng serve
```

**Verify Frontend**: Visit `http://localhost:4200`

### Step 4: Test the Implementation

#### A. Basic Page Creation & Selection
1. **Register/Login**: Create account or login
2. **Create Pages**: Use "+ New Page" button in sidebar
3. **Click Pages**: Click any page → should load in editor
4. **Edit Content**: Type in editor → should save automatically

#### B. Hierarchical Organization
1. **Create Child Pages**: Click "+" next to a page to create sub-pages
2. **View Hierarchy**: Pages should display in tree structure with indentation
3. **Navigate**: Click different pages to switch between them

#### C. Drag-and-Drop Testing
1. **Reorder Pages**: Drag pages up/down within same level
2. **Move Between Levels**: Drag pages to different parent pages
3. **Visual Feedback**: Should see drag preview and drop targets
4. **Persistence**: Refresh page → changes should remain

#### D. Error Testing
1. **Network Issues**: Disconnect internet → try drag-and-drop
2. **Console Logs**: Check browser console for success/error messages
3. **UI Revert**: Failed operations should revert UI automatically

### Step 5: API Testing (Optional)

#### Test Backend Endpoints
```bash
# 1. Register user
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'

# 2. Login
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"test","password":"password123"}'

# 3. Create pages
curl -X POST http://localhost:8080/api/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Test Page","icon":"📄"}'

# 4. Get all pages (should be ordered)
curl -X GET http://localhost:8080/api/pages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 Expected Behavior

### ✅ What Should Work
- **Page Selection**: Click page → loads in editor
- **Drag-and-Drop**: Smooth reordering and moving
- **Hierarchy**: Proper parent-child relationships
- **Persistence**: Changes saved to database
- **Error Handling**: Failed operations revert UI
- **Visual Feedback**: Drag previews and drop targets

### ❌ Common Issues & Solutions

#### Frontend Issues
1. **Drag-and-Drop Not Working**
   - Check browser console for errors
   - Ensure Angular CDK is properly imported
   - Verify cdkDropList and cdkDrag directives

2. **Pages Not Loading**
   - Check network tab for failed requests
   - Verify backend is running on port 8080
   - Check JWT token in localStorage

#### Backend Issues
1. **Compilation Errors**
   - Ensure Java 21+ is installed
   - Check all imports are correct
   - Verify Maven dependencies

2. **Database Connection**
   - Ensure MongoDB is running
   - Check connection string in application.properties
   - Verify database permissions

## 🔧 Debug Mode

### Enable Debug Logging
Add to `backend/src/main/resources/application.properties`:
```properties
logging.level.com.clone.notion=DEBUG
logging.level.org.springframework.security=DEBUG
```

### Browser Developer Tools
- **Console**: Check for JavaScript errors
- **Network**: Monitor API requests/responses
- **Application**: Check localStorage for JWT tokens

## 📊 Success Indicators

### Backend
- ✅ Health check returns `{"status":"UP"}`
- ✅ User registration/login works
- ✅ Page CRUD operations work
- ✅ Move/order endpoints respond correctly

### Frontend
- ✅ Pages load in sidebar
- ✅ Clicking pages loads them in editor
- ✅ Drag-and-drop works smoothly
- ✅ Changes persist after refresh
- ✅ Error handling works (reverts on failure)

### Integration
- ✅ Sidebar ↔ Editor communication works
- ✅ Drag-and-drop ↔ Backend persistence works
- ✅ Hierarchical structure displays correctly
- ✅ Real-time updates work

## 🎉 Congratulations!

If all tests pass, you have successfully implemented:
- ✅ Hierarchical page organization
- ✅ Drag-and-drop functionality
- ✅ Sidebar-editor integration
- ✅ Backend persistence
- ✅ Error handling
- ✅ Real-time updates

Your Notion clone now has professional-grade page organization capabilities! 