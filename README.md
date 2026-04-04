# OpsCore IT Support System

This project is an internal IT support platform for handling day-to-day operational work. It includes monitoring, asset management, ticketing, audit logs, and a help center for end users.

The repository is organized as a small monorepo:
- `backend/` for the Laravel API
- `frontend/` for the Next.js application
- `mobile/` for the Expo React Native application
- `docker/` for the Nginx setup

## Stack

- Backend: Laravel 11
- Frontend: Next.js 14
- Mobile: Expo + React Native
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

### Production via Docker

```bash
docker compose up -d --build
```

Production endpoint:
- App and API: `https://support.akhdnn.web.id`

For Docker-based deployment, copy the root example file first:

```bash
cp .env.example .env
```

The root `.env` is the production-oriented Docker configuration.

### Local development

Backend:

```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

Frontend:

```bash
cd frontend
npm run dev
```

Mobile:

```bash
cd mobile
npm install
npx expo start
```

Default local endpoints:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

Recommended local example files:
- root production Docker: `.env.example`
- backend local: `backend/.env.example`
- frontend local: `frontend/.env.local.example`
- mobile local: `mobile/.env.example`
- mobile production: `mobile/.env.production.example`

For mobile local development, use a LAN-reachable backend URL in `mobile/.env`.
For device testing with a local backend, make sure Laravel is bound to `0.0.0.0`.

## Environment

### Production

Use the root `.env` created from `.env.example`.

Production values in this repository are documented against:
- `APP_URL=https://support.akhdnn.web.id`
- `FRONTEND_URL=https://support.akhdnn.web.id`
- `NEXT_PUBLIC_API_URL=https://support.akhdnn.web.id/api`
- `CORS_ALLOWED_ORIGINS=https://support.akhdnn.web.id`

Typical production variables:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://support.akhdnn.web.id`
- `FRONTEND_URL=https://support.akhdnn.web.id`
- `NEXT_PUBLIC_API_URL=https://support.akhdnn.web.id/api`
- `CORS_ALLOWED_ORIGINS=https://support.akhdnn.web.id`
- `MYSQL_DATABASE=...`
- `MYSQL_USERNAME=...`
- `MYSQL_ROOT_PASSWORD=...`
- `APP_KEY=...`
- `PAGE_GATE_PIN_HASH=...`
- `SESSION_SECURE_COOKIE=true`

### Local

Use separate local-only files:
- `backend/.env` copied from `backend/.env.example`
- `frontend/.env.local` copied from `frontend/.env.local.example`
- `mobile/.env` copied from `mobile/.env.example`

Typical local values:
- `APP_URL=http://localhost:8000`
- `FRONTEND_URL=http://localhost:3000`
- `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
- `CORS_ALLOWED_ORIGINS=http://localhost:3000`
- `EXPO_PUBLIC_API_URL=http://YOUR-LAN-IP:8000/api`

## Folder Structure

- `backend/`: Laravel API, database migrations, application logic
- `frontend/`: Next.js app, UI components, pages, client-side state
- `docker/`: Nginx configuration used by Docker
- `docker-compose.yml`: service orchestration for Docker
- `.env`: deployment environment for Docker

## Notes on Authentication and Access

- Users authenticate through the backend and access the frontend through the same system domain setup
- Mobile app authentication uses bearer tokens from the same `/api/login` endpoint by sending `use_token=true`
- Some pages, such as monitoring, use an additional page gate PIN
- Access to sensitive sections depends on role-based restrictions

## Deployment Notes

Before deploying:
- copy `.env.example` to `.env` and fill all secrets with real values
- use `support.akhdnn.web.id` consistently in `APP_URL`, `FRONTEND_URL`, `NEXT_PUBLIC_API_URL`, and `CORS_ALLOWED_ORIGINS`
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
