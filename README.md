# Hemspire Tamil Poetry

Hemspire is a fullstack poetry platform for publishing and exploring Tamil poetry in image, audio, and video formats.

## Project Structure

- `hemspire_frontend/`: React application (UI, media browsing, likes, admin screens)
- `hemspire_backend/`: Spring Boot REST API (auth, media management, admin, profile)
- `uploads/`: local upload storage (runtime-generated; excluded from git)

## Core Features

- JWT-based authentication and role-based authorization (`USER`, `ADMIN`)
- Media modules:
  - Poems (image-based)
  - Audio poems
  - Video poems
- Like/unlike support with per-user liked state
- Search support across media content
- Admin dashboard:
  - platform stats
  - role management
  - user management
- Profile page with editable local profile details and avatar

## Tech Stack

- Frontend: React, React Router
- Backend: Spring Boot, Spring Security, Spring Data JPA
- Database: MySQL
- API docs: Springdoc OpenAPI / Swagger UI

## Local Development

### 1. Backend

```bash
cd hemspire_backend
./mvnw spring-boot:run
```

### 2. Frontend

```bash
cd hemspire_frontend
npm install
npm start
```

By default:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

## Notes

- Build artifacts and local uploads are intentionally excluded from git.
- Configure environment/database values in backend `application.properties` as needed.

