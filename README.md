# Fitscale Backend

REST API for Fitscale — user auth, user management, workout tracking, and badge processing. Built with **Express 5**, **TypeScript**, **Prisma** (PostgreSQL), **Redis**, and **RabbitMQ**.

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Runtime | Node.js 20+ |
| Framework | Express 5 |
| Language | TypeScript |
| Database | PostgreSQL 16 (Prisma ORM + `@prisma/adapter-pg`) |
| Cache | Redis 7 (`redis` npm package) |
| Message queue | RabbitMQ 3 (`amqplib`) — workout events for badge workers |
| Auth | JWT in httpOnly cookies, bcrypt password hashing |
| Validation | Zod |
| Reverse proxy | Nginx (Docker only) |
| Tooling | helmet, cors, cookie-parser, morgan, dotenv |

---

## Prerequisites

- **Node.js** >= 20 LTS
- **PostgreSQL** >= 14 (local or Docker)
- **Redis** >= 7 (local or Docker)
- **RabbitMQ** >= 3 (local or Docker)
- **Docker + Docker Compose** (recommended — easiest way to run Postgres, Redis, and RabbitMQ together)

---

## Environment Variables

Create a `.env` file in the project root:

```bash
# PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitscale?schema=public"

# JWT secrets — use different values in production
JWT_SECRET="<long-random-secret>"
JWT_REFRESH_SECRET="<another-long-random-secret>"

# Redis
REDIS_URL="redis://localhost:6379"

# Server
PORT=5001
NODE_ENV=development

# Frontend origin for CORS (cookie auth requires a specific origin)
CLIENT_URL="http://localhost:3000"
```

Generate secrets:

```bash
openssl rand -hex 32
```

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DATABASE_URL` | Yes | Postgres connection string |
| `JWT_SECRET` | Yes | Signs access tokens (1h) |
| `JWT_REFRESH_SECRET` | Yes | Signs refresh tokens (7d) |
| `REDIS_URL` | Yes | Redis connection URL |
| `PORT` | No | API port (default `5001`) |
| `NODE_ENV` | No | `development` or `production` |
| `CLIENT_URL` | No | Allowed CORS origin (default `http://localhost:3000`) |

> **macOS:** avoid `PORT=5000` — AirPlay Receiver uses it and returns HTTP 403. Default is `5001`.

> **Never commit `.env`** — it is listed in `.gitignore`.

---

## Local Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start dependencies (Postgres, Redis, RabbitMQ)

The API connects to **all three** on startup. If Redis or RabbitMQ is not running, `npm run dev` will fail with a connection error (`AggregateError` / `ECONNREFUSED`).

**Option A — Docker (recommended):**

```bash
docker compose up db redis rabbitmq -d
```

That is all you need — no separate install or manual startup for each service. Compose pulls the images (first run only), starts the containers, and publishes ports to your machine.

Verify they are up:

```bash
docker compose ps
# db, redis, and rabbitmq should show "Up" (redis also "healthy")
```

**Option B — Install locally:**

- Postgres: `brew install postgresql@16` (macOS) or your OS package manager
- Redis: `brew install redis && brew services start redis` (macOS)
- RabbitMQ: `brew install rabbitmq && brew services start rabbitmq` (macOS)

If you install locally, RabbitMQ must listen on **port 5672** (the default) to match the app.

### 3. Configure `.env`

Use the template above. For Docker-backed dependencies, point at the **host** ports Compose publishes:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitscale?schema=public"
REDIS_URL="redis://localhost:6379"
# RabbitMQ URL is currently hardcoded in src/lib/rabbitmq.ts as amqp://guest:guest@localhost:5672
```

### 4. Sync the database

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Start the API

```bash
npm run dev
```

Verify:

```bash
curl http://localhost:5001/health
# {"success":true,"message":"Backend running"}
```

You should also see both of these in the server logs:

```
Redis Connected
RabbitMQ Connected
```

If either line is missing, the matching service is not running or is on the wrong port.

---

## Redis

### What Redis is used for

Redis is configured as a shared client in `src/lib/redis.ts`. The server imports it on startup (`src/server.ts`) so the connection is established before handling requests. Use the exported `redis` client anywhere you need caching, session storage, rate limiting, etc.

```typescript
import { redis } from "../lib/redis";

await redis.set("key", "value", { EX: 3600 });
const value = await redis.get("key");
```

### Client configuration

```1:14:src/lib/redis.ts
import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});

(async () => {
  await redis.connect();
  console.log("Redis Connected");
})();
```

- Connection URL comes from `REDIS_URL`
- Errors are logged but do not crash the process
- Connection is lazy-initialized when the module is imported

### Local vs Docker URLs

| Environment | `REDIS_URL` | Why |
| ----------- | ----------- | --- |
| Local dev (Redis on host) | `redis://localhost:6379` | Connect to Redis on your machine |
| Local dev (Redis via Compose) | `redis://localhost:6379` | Port `6379` is published to the host |
| API inside Docker Compose | `redis://redis:6379` | `redis` is the Docker service name |

> Inside Docker, **never** use `localhost` for Redis or Postgres — `localhost` refers to the container itself, not other services.

### Verify Redis

```bash
# Local CLI
redis-cli ping
# PONG

# Docker
docker compose exec redis redis-cli ping
# PONG
```

### Do I need to start Redis manually?

| How you run the API | What to do |
| ------------------- | ---------- |
| `npm run dev` (local) | Start Redis first: `docker compose up redis -d` (or run Redis locally) |
| `docker compose up` (full stack) | Redis starts automatically with the stack |

Redis has a healthcheck in Compose. The `api` service waits for Redis to be healthy before starting.

---

## RabbitMQ

### What RabbitMQ is used for

RabbitMQ handles async workout events. When a workout is created, the API publishes a message to the `workout-created` queue. Badge workers consume that queue to award badges.

- Client: `src/lib/rabbitmq.ts`
- Producer: `src/modules/workouts/workout.producer.ts`
- Consumer: `src/modules/badge/workers/badge.worker.ts`

On startup, `connectRabbit()` in `src/server.ts` connects and asserts the `workout-created` queue.

### Connection details

| Setting | Value |
| ------- | ----- |
| AMQP URL (local dev) | `amqp://guest:guest@localhost:5672` |
| AMQP port (host) | `5672` |
| Management UI | [http://localhost:15672](http://localhost:15672) |
| Default credentials | `guest` / `guest` |

> The connection URL is currently hardcoded in `src/lib/rabbitmq.ts`. When running the API locally with Docker-backed RabbitMQ, ensure Compose maps **`5672:5672`** (the default in `docker-compose.yml`).

### Local vs Docker URLs

| Environment | How the API reaches RabbitMQ |
| ----------- | ------------------------------ |
| Local dev (`npm run dev`) | `localhost:5672` — Compose publishes port `5672` to the host |
| API inside Docker Compose | `localhost:5672` inside the container **will not work** — use the service name `rabbitmq` (requires a code/env change; local dev is the supported path today) |

### Verify RabbitMQ

```bash
# Check the port is open
nc -zv localhost 5672

# Docker — list queues (after at least one API startup)
docker compose exec rabbitmq rabbitmqctl list_queues

# Management UI — open in browser
open http://localhost:15672   # macOS
# Log in with guest / guest
```

### Do I need to start RabbitMQ manually?

| How you run the API | What to do |
| ------------------- | ---------- |
| `npm run dev` (local) | Start RabbitMQ first: `docker compose up rabbitmq -d` (or run RabbitMQ locally) |
| `docker compose up` (full stack) | RabbitMQ starts with the stack, but the API still connects via `localhost:5672` today — prefer **local API + Docker dependencies** for development |

**Recommended local dev command** (starts all backing services in one go):

```bash
docker compose up db redis rabbitmq -d
npm run dev
```

---

## Database & Prisma

Schema lives in `prisma/schema.prisma`. Migrations are in `prisma/migrations/`.

### Common commands

| Command | When to use |
| ------- | ----------- |
| `npx prisma generate` | After schema changes — regenerates the typed client |
| `npx prisma migrate dev --name <change>` | Dev: create + apply a migration |
| `npx prisma migrate deploy` | Prod/Docker: apply pending migrations |
| `npx prisma migrate status` | Check if DB matches migration history |
| `npx prisma migrate reset` | **Drops all data** and re-applies migrations |
| `npx prisma db push` | Quick prototype sync (no migration files) |

### Typical workflow after a schema change

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name describe_change`
3. Update services/controllers
4. Restart the dev server

---

## Running the Project

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Dev server with hot reload (`ts-node-dev`) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run production build |
| `npm run typecheck` | Type-check without emitting files |

### Production (without Docker)

```bash
npm run build
npm start
```

> Do **not** commit `dist/` — it is build output. Run `npm run build` after pulling changes or in CI/Docker.

---

## Docker Setup

The stack runs six services:

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  nginx  │────▶│   api   │────▶│   db    │
│  :80    │     │  :5001  │     │  :5432  │
└─────────┘     └────┬────┘     └─────────┘
                     │
           ┌─────────┴─────────┐
           ▼                   ▼
     ┌─────────┐         ┌───────────┐
     │  redis  │         │ rabbitmq  │
     │  :6379  │         │ :5672     │
     └─────────┘         │ :15672 UI │
                         └───────────┘
```

| Service | Image | Host port | Purpose |
| ------- | ----- | --------- | ------- |
| `db` | `postgres:16-alpine` | 5432 | PostgreSQL database |
| `redis` | `redis:7-alpine` | 6379 | Redis cache |
| `rabbitmq` | `rabbitmq:3-management` | 5672, 15672 | Message queue + management UI |
| `api` | Built from `Dockerfile` | 5001 | Express API |
| `nginx` | `nginx:alpine` | 80 | Reverse proxy → API |

### 1. Configure `.env`

Docker Compose reads secrets from your host `.env`. You need at minimum:

```bash
JWT_SECRET="<long-random-secret>"
JWT_REFRESH_SECRET="<another-long-random-secret>"
```

Compose **overrides** `DATABASE_URL` and `REDIS_URL` inside the `api` container to point at the `db` and `redis` services — you do not need to change those for Docker.

Optional:

```bash
CLIENT_URL="http://localhost:3000"
```

### 2. Build and start

```bash
docker compose up --build
```

Detached mode:

```bash
docker compose up --build -d
```

On startup the `api` service:

1. Waits for `db` and `redis` to be healthy
2. Runs `npx prisma migrate deploy` (applies committed migrations)
3. Starts `node dist/server.js`

### 3. Verify

```bash
# Direct to API
curl http://localhost:5001/health

# Through nginx
curl http://localhost/health
```

### Common Docker commands

| Command | Description |
| ------- | ----------- |
| `docker compose up --build` | Build images and start all services |
| `docker compose up db redis rabbitmq -d` | Start only dependencies (for local `npm run dev`) |
| `docker compose up redis -d` | Start only Redis |
| `docker compose up rabbitmq -d` | Start only RabbitMQ |
| `docker compose logs -f api` | Tail API logs |
| `docker compose ps` | List running services |
| `docker compose down` | Stop and remove containers |
| `docker compose down -v` | Stop and **delete database volume** (fresh DB) |
| `docker compose exec api sh` | Shell into the API container |
| `docker compose exec redis redis-cli ping` | Test Redis |

### Cold start (from scratch)

```bash
docker compose down -v
docker compose up --build
```

---

## Syncing with Docker

Use this checklist whenever you change code, schema, or configuration.

### After code changes (TypeScript)

The `Dockerfile` compiles TypeScript during the image build. Rebuild the API image:

```bash
docker compose up --build api
```

Or rebuild everything:

```bash
docker compose up --build
```

### After Prisma schema changes

1. Create a migration locally:

   ```bash
   npx prisma migrate dev --name your_change
   ```

2. Commit the new folder under `prisma/migrations/`

3. Restart the API container (runs `migrate deploy` on startup):

   ```bash
   docker compose up --build api
   ```

> The `api` service uses `npx prisma migrate deploy`, **not** `db push`. Always commit migration files before deploying.

### After `.env` changes

Compose reads `.env` when containers are **created**. Restart affected services:

```bash
docker compose up -d --force-recreate api
```

### After `docker-compose.yml` changes

```bash
docker compose down
docker compose up --build
```

### After `nginx/nginx.conf` changes

Nginx mounts the config as a volume — restart nginx only:

```bash
docker compose restart nginx
```

### After `package.json` dependency changes

Rebuild the image (dependencies are installed at build time):

```bash
docker compose build --no-cache api
docker compose up -d api
```

### Local dev + Docker dependencies

Run Postgres, Redis, and RabbitMQ in Docker; run the API on your machine:

```bash
# Terminal 1 — dependencies only (one command starts all three)
docker compose up db redis rabbitmq -d

# Terminal 2 — API locally
npm run dev
```

Ensure `.env` uses host URLs:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitscale?schema=public"
REDIS_URL="redis://localhost:6379"
```

You do **not** need to run `docker run redis` or `docker run rabbitmq` separately — always use `docker compose up` for this project. Container names like `fitscale-backend-redis-1` are created by Compose; they are not image names.

Stop dependencies when done:

```bash
docker compose stop db redis rabbitmq
```

---

## API Reference

Base URL: `http://localhost:5001` (or `http://localhost` via nginx)

### Auth (public)

Auth uses **httpOnly cookies** — tokens are not returned in the JSON body.

| Method | Endpoint | Body | Description |
| ------ | -------- | ---- | ----------- |
| `POST` | `/api/auth/register` | `{ email, password }` | Register (password min 8 chars) |
| `POST` | `/api/auth/login` | `{ email, password }` | Login — sets `accessToken` + `refreshToken` cookies |
| `POST` | `/api/auth/refresh-token` | — | Refresh tokens — requires `refreshToken` cookie |
| `POST` | `/api/auth/logout` | — | Logout — requires `refreshToken` cookie, clears cookies |

### Users (protected — `accessToken` cookie)

| Method | Endpoint | Access | Body |
| ------ | -------- | ------ | ---- |
| `POST` | `/api/users` | — | `{ email, password, role? }` |
| `GET` | `/api/users` | Admin | — |
| `GET` | `/api/users/:id` | Owner or admin | — |
| `PUT` | `/api/users/:id` | Owner or admin | `{ email?, password?, role? }` |
| `DELETE` | `/api/users/:id` | Owner or admin | — |
| `DELETE` | `/api/users` | Admin | — |

User responses omit `passwordHash` and `token`.

Roles: `ADMIN`, `TRAINER`, `USER`

### Workouts (protected — `accessToken` cookie)

Scoped to the authenticated user.

| Method | Endpoint | Body |
| ------ | -------- | ---- |
| `GET` | `/api/workouts` | — |
| `POST` | `/api/workouts` | `{ workoutType, count }` |

`workoutType`: `PUSHUP` | `SQUAT` | `SITUP` | `PLANK`  
`count`: positive integer

### Health

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/health` | `{ success, message }` |

### Postman

Import [`fitscale.postman_collection.json`](./fitscale.postman_collection.json) via **Postman → Import**.  
Login first — Postman sends cookies automatically on subsequent requests.

---

## Project Structure

```
src/
  server.ts                          # Entry point — middleware, routes, startup
  lib/
    prisma.ts                        # Prisma client (pg adapter)
    redis.ts                         # Redis client (connects on import)
    rabbitmq.ts                      # RabbitMQ connection + queue setup
  middleware/
    authentication.middleware.ts     # JWT cookie verification
    authorisation.middleware.ts      # Role + owner checks
    validate.middleware.ts           # Zod request validation
  routes/
    index.ts                         # Mounts /auth, /users, /workouts
  modules/
    auth/                            # Register, login, refresh, logout
    users/                           # User CRUD
    workouts/                        # Workout create / list + queue producer
    badge/                           # Badge routes + RabbitMQ consumer worker
  validators/                        # Zod schemas
  utils/
    user.ts                          # Sanitize user objects
nginx/
  nginx.conf                         # Reverse proxy config (Docker)
prisma/
  schema.prisma                      # Database schema
  migrations/                        # Versioned SQL migrations
docker-compose.yml                   # Multi-service stack
Dockerfile                           # Multi-stage API image
```

---

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| `secretOrPrivateKey must have a value` | Set `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env`, restart |
| `Redis Error: ECONNREFUSED` | Start Redis: `docker compose up redis -d`. Check `REDIS_URL=redis://localhost:6379` |
| `Redis Connected` never appears | Ensure `import "./lib/redis"` is in `server.ts` and Redis is running |
| `AggregateError` right after `Server running on 5001` | RabbitMQ is not running or wrong port. Run `docker compose up rabbitmq -d` and confirm port **5672** (`nc -zv localhost 5672`) |
| `RabbitMQ Connected` never appears | Start RabbitMQ before `npm run dev`. Check `docker compose ps` |
| RabbitMQ port conflict on `5672` | Something else is using 5672: `lsof -i :5672`. Stop that process or change the host port in `docker-compose.yml` **and** update `src/lib/rabbitmq.ts` to match |
| `docker run fitscale-backend-redis-1` fails | That is a container name, not an image. Use `docker compose up redis -d` instead |
| `EADDRINUSE` on port 5001 | Another process (often a previous `npm run dev`) is using the port: `kill -9 $(lsof -tiTCP:5001 -sTCP:LISTEN)` or use a different `PORT` in `.env` |
| Prisma can't connect locally | Confirm Postgres is running; verify `DATABASE_URL` |
| Prisma can't connect in Docker | Use service name `db`, not `localhost`, in Compose env |
| Cookies not sent from browser | Set `CLIENT_URL` to your frontend origin; CORS does not allow `*` with credentials |
| Cookies not stored on localhost | `Secure` cookies only apply when `NODE_ENV=production` |
| `HTTP 403` on port 5000 (macOS) | Use `PORT=5001` or disable AirPlay Receiver |
| Docker API fails on startup | Check logs: `docker compose logs api`. Often missing JWT secrets or migration failure |
| nginx returns 502 | API not ready — `docker compose logs api`. Confirm `proxy_pass http://api:5001` in `nginx/nginx.conf` |
| Schema out of sync in Docker | Run `docker compose exec api npx prisma migrate deploy` or rebuild with committed migrations |
| TypeScript build fails in Docker | Run `npm run typecheck` locally first — Docker runs `npm run build` |

---

## Quick Reference

```bash
# Full local setup
npm install
docker compose up db redis rabbitmq -d
npx prisma migrate dev
npm run dev
# Expect: "Redis Connected" and "RabbitMQ Connected" in logs

# Full Docker stack
docker compose up --build

# Reset Docker database
docker compose down -v && docker compose up --build
```
