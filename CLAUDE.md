# Maison Sent — Project Guide

## Stack

### Backend
- **Framework**: NestJS + TypeScript
- **ORM**: TypeORM — repository pattern only (no `DataSource` or `EntityManager` direct usage)
- **Database**: PostgreSQL
- **Runtime**: Node.js 20

### Frontend
- **Framework**: React + TypeScript
- **Styling**: TailwindCSS

---

## Architecture Rules


- **Modular / domain-driven**: each domain lives in its own NestJS module (`src/users/`, `src/products/`, etc.)
- **Controllers are thin**: no business logic, only call services and return responses
- **Business logic in services only**
- **DTO validation mandatory**: every request body uses a DTO class decorated with `class-validator`; global `ValidationPipe` with `whitelist: true, transform: true` is enabled
- **UUID primary keys** on all entities
- **Soft delete support**: entities use `@DeleteDateColumn() deletedAt` — never hard-delete
- **Centralized error handling**: use NestJS exception filters, never throw raw errors from controllers
- **Environment-based configuration**: all secrets/config via `ConfigService`, never hardcoded
- **Repository pattern only**: inject TypeORM repositories via `@InjectRepository()`, no raw `DataSource` queries

---

## Authentication


- JWT **access tokens** (short-lived, e.g. 1h)
- Hashed **refresh tokens** (long-lived, stored hashed with bcrypt, e.g. 30d)
- **Role-based authorization** via NestJS guards (`@Roles()` decorator + `RolesGuard`)
- Optional **phone OTP** support
- Passwords hashed with **bcrypt**

---

## Storage

- **AWS S3** for file storage
- Files uploaded via **presigned URLs** (backend generates the URL, client uploads directly to S3)

---

## Notifications

- **Firebase Admin SDK** prepared
- Notification entity architecture ready

---

## API Documentation

- Swagger / OpenAPI available at **`/api/docs`**
- All controllers must have `@ApiTags()` and DTOs must have `@ApiProperty()` decorators

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | HTTP server port (default 3000) |
| `DATABASE_HOST` | Postgres host |
| `DATABASE_PORT` | Postgres port |
| `DATABASE_USER` | Postgres user |
| `DATABASE_PASSWORD` | Postgres password |
| `DATABASE_NAME` | Postgres database name |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES` | Access token TTL (e.g. `1h`) |
| `JWT_REFRESH_EXPIRES` | Refresh token TTL (e.g. `30d`) |

---

## Module Structure Convention

```
src/
  <domain>/
    dto/
      create-<domain>.dto.ts
      update-<domain>.dto.ts
    entities/
      <domain>.entity.ts
    <domain>.controller.ts
    <domain>.service.ts
    <domain>.module.ts
```

---

## Key Commands

```bash
# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Tests
npm run test
npm run test:e2e

# Lint / format
npm run lint
npm run format
```
