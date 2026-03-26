# IT Support Management System

This project is an internal IT support platform for handling day-to-day operational work. It includes monitoring, asset management, ticketing, audit logs, and a help center for end users.

The repository is organized as a small monorepo:
- `backend/` for the Laravel API
- `frontend/` for the Next.js application
- `docker/` for the Nginx setup

## Stack

- Backend: Laravel 11
- Frontend: Next.js 14
- Database: MySQL for Docker deployment, SQLite for local testing if needed
- Reverse proxy: Nginx
- Authentication: Laravel Sanctum with cookie-based access flow

## Main Features

- Infrastructure and host monitoring
- Asset and device unit management
- Ticketing for incidents and requests
- Audit logs for important actions
- User guide center for non-technical users
- Basic account settings and password update

## Running the Project

There are two common ways to run this project:
- Docker, which is the main deployment path
- Local development, where backend and frontend are started separately

### Docker

```bash
docker compose up -d --build
```

Default service endpoints:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

For Docker-based deployment, the main configuration file is the root `.env`.

### Local development

Backend:

```bash
cd backend
php artisan serve
```

Frontend:

```bash
cd frontend
npm run dev
```

Default local endpoints:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

## Environment

The project currently uses these environment files:
- root `.env`: for Docker and deployment
- `backend/.env`: for running Laravel locally without Docker
- `frontend/.env.local`: for running Next.js locally without Docker

If you deploy with Docker, the root `.env` is the main file you need to update.

Typical production values include:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://your-domain`
- `FRONTEND_URL=https://your-domain`
- `NEXT_PUBLIC_API_URL=https://your-domain/api`
- `CORS_ALLOWED_ORIGINS=https://your-domain`
- `MYSQL_DATABASE=...`
- `MYSQL_USERNAME=...`
- `MYSQL_ROOT_PASSWORD=...`
- `APP_KEY=...`
- `PAGE_GATE_PIN_HASH=...`
- `SESSION_SECURE_COOKIE=true`

## Folder Structure

- `backend/`: Laravel API, database migrations, application logic
- `frontend/`: Next.js app, UI components, pages, client-side state
- `docker/`: Nginx configuration used by Docker
- `docker-compose.yml`: service orchestration for Docker
- `.env`: deployment environment for Docker

## Notes on Authentication and Access

- Users authenticate through the backend and access the frontend through the same system domain setup
- Some pages, such as monitoring, use an additional page gate PIN
- Access to sensitive sections depends on role-based restrictions

## Deployment Notes

Before deploying:
- make sure the root `.env` is complete
- use a real production domain in `APP_URL`, `FRONTEND_URL`, and `NEXT_PUBLIC_API_URL`
- enable secure cookies in production
- do not reuse local testing secrets
- make sure your reverse proxy and DNS are already pointed to the correct host

To start the full stack:

```bash
docker compose up -d --build
```

To stop it:

```bash
docker compose down
```

If this is the first deployment, run the required backend setup inside the backend container, for example migrations and any initial seeding you actually need.

## Repository Notes

Local and generated files should not be pushed to GitHub, for example:

- `backend/.env`
- `frontend/.env.local`
- `backend/database/database.sqlite`
- `backend/storage/logs/*`
- `frontend/.next`
- `frontend/node_modules`
- `backend/vendor`

Before pushing to a public repository, make sure secrets, local databases, logs, and backup files are not committed.

## Current Scope

This repository is intended for internal IT support workflows. It is not meant to expose local development data, temporary credentials, debug files, or machine-specific environment files.
