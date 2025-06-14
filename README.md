# Notion Clone (MVCX)

This repository contains a minimal **Notion-like** application scaffold:

* **Backend** – Spring Boot 3 (Java 17), MongoDB, MVCX (Model-Repository-Service-Controller) pattern.
* **Frontend** – Angular 17 (TypeScript) – created with Angular CLI.
* **Database** – MongoDB.

---

## Directory layout

```text
backend/   # Spring Boot REST API
frontend/  # Angular single-page app (to be generated)
```

## Prerequisites

1. **Java 17+** – for the Spring Boot backend.
2. **Maven 3.8+** – build tool for the backend.
3. **Node 18+** & **npm** – for Angular CLI.
4. **MongoDB 6+** running locally on `mongodb://localhost:27017`.

---

## Getting started

### 1. Backend

```powershell
# from the repository root
cd backend
mvn spring-boot:run
```

The API will start on <http://localhost:8080>.  A test endpoint:

```http
GET http://localhost:8080/api/pages
```

### 2. Frontend

```powershell
npm install -g @angular/cli
ng new frontend --style=scss --routing=true --skip-git --skip-install=false
cd frontend
npm start
```

Once the dev-server is running at <http://localhost:4200>, the sample REST controller is already CORS-enabled for that origin.

---

## Next steps

1. Design the Angular component hierarchy (Sidebar, Topbar, PageEditor, DatabaseViews…).
2. Replace the simple `Page` document with richer content blocks.
3. Implement authentication (Spring Security & JWT).
4. Containerise with Docker-Compose (MongoDB + API + Frontend).
5. Deploy to cloud (Render / Heroku / Fly.io / AWS ECS…).

Happy hacking! 