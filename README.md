# Intern Assignment Project

Complete full-stack implementation for:
- JWT authentication with hashed passwords
- Role-based access (`user` vs `admin`)
- CRUD APIs for `tasks`
- API versioning (`/api/v1`), validation, centralized error handling
- Swagger + Postman documentation
- Local JSON data storage (no database required)
- Basic frontend UI to test all APIs

## Project Structure

- `backend/` Express API with file-based local datastore (`backend/data/db.json`)
- `frontend/` Vanilla JS UI for auth + dashboard + tasks

## Backend Setup (No Docker, No DB)

1. `cd backend`
2. Ensure `.env` exists (already created)
3. Install dependencies: `npm install`
4. Initialize local store: `npm run migrate`
5. Start API: `npm run dev`

Backend base URL: `http://localhost:5000`

## Frontend Setup

Use any static server from project root (or inside `frontend`):

- Python: `python -m http.server 5500`
- Then open: `http://localhost:5500/frontend`

In the UI, keep API Base URL as `http://localhost:5000/api/v1`.

## API Endpoints (v1)

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/tasks` (auth)
- `POST /api/v1/tasks` (auth)
- `GET /api/v1/tasks/:id` (auth)
- `PUT /api/v1/tasks/:id` (auth)
- `DELETE /api/v1/tasks/:id` (auth)
- `GET /api/v1/users` (admin only)

## API Documentation

- Swagger UI: `http://localhost:5000/api-docs`
- Postman collection: `backend/docs/postman_collection.json`

## Local Data Storage

All data is stored in `backend/data/db.json` with collections:
- `users`
- `tasks`
- `meta` (ID counters)

## Security Implemented

- Password hashing via `bcryptjs`
- JWT-based authentication (`Authorization: Bearer <token>`)
- Role checks for admin-only routes
- Input validation with `zod`
- Basic sanitization (trim + tag-char stripping)
- Helmet and CORS middleware

## Scalability Note

See: `backend/docs/scalability-note.md`

## Logging

- Request logs via `morgan`
- For assignment submission logs, capture terminal output to files, for example:
  - PowerShell backend logs: `npm run dev *> backend.log`