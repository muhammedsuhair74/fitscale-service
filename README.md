# Fitscale Backend

REST API for Fitscale, built with **Express 5**, **TypeScript**, and **Prisma** (PostgreSQL). It handles authentication, users, and workout tracking.

## Tech Stack

- **Runtime:** Node.js + Express 5
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM (with the `@prisma/adapter-pg` driver adapter)
- **Auth:** JWT (`jsonwebtoken`) stored in an httpOnly cookie, passwords hashed with `bcrypt`
- **Security/Tooling:** `helmet`, `cors`, `cookie-parser`, `morgan`, `dotenv`, `zod`

## Prerequisites

- **Node.js** >= 20 LTS (includes `npm`)
- **PostgreSQL** >= 14 running locally or remotely

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitscale?schema=public"

# Secret used to sign JWTs (use a long random value)
JWT_SECRET="replace-with-a-long-random-secret"

# Optional
PORT=5001
NODE_ENV=development
```

> Generate a strong secret with: `openssl rand -hex 32`

> [!WARNING]
> On macOS, avoid `PORT=5000` — it's used by the AirPlay Receiver (Control Center) and returns `HTTP 403`. The default is `5001`.

### 3. Set up the database

Generate the Prisma client and create the tables from `prisma/schema.prisma`:

```bash
npx prisma generate     # generate the typed Prisma client
npx prisma db push      # sync the schema to your database (no migration history)
```

`db push` is quick for prototyping but does **not** create migration files. For a tracked, repeatable schema history use migrations (below).

## Database Migrations

Prisma migrations live in `prisma/migrations/`. Use them to version your schema changes.

### Creating the first migration

Choose one of the two approaches depending on whether you need to keep existing data.

**A. Fresh start — drops all tables/data** (simplest; use when the data is disposable):

```bash
npx prisma migrate dev --name init
```

When prompted about resetting the database, confirm. This resets the DB, creates `prisma/migrations/<timestamp>_init/`, applies it, and regenerates the client.

To reset on demand at any time (also **drops all data**):

```bash
npx prisma migrate reset
```

**B. Baseline — keeps existing data** (use when the database already has data created via `db push`):

```bash
# 1. Create the init migration folder
mkdir -p prisma/migrations/0_init

# 2. Generate SQL for the current schema from an empty baseline
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0_init/migration.sql

# 3. Mark it as already applied (does NOT modify your data)
npx prisma migrate resolve --applied 0_init
```

### Ongoing workflow

After editing `prisma/schema.prisma`, create and apply a new migration in development:

```bash
npx prisma migrate dev --name describe_your_change
```

### Applying migrations in production

```bash
npx prisma migrate deploy
```

> In Docker, switch the `api` service command in `docker-compose.yml` from `npx prisma db push` to `npx prisma migrate deploy` to apply migrations on startup.

## Syncing Schema Changes to the Database

When you edit `prisma/schema.prisma` — for example, adding a column, model, or enum — use one of the flows below to update your Postgres database and keep the Prisma Client in sync.

### Check migration status

See whether pending migrations exist and if the database matches `prisma/migrations/`:

```bash
npx prisma migrate status
```

### Development — recommended (migrations)

After editing the schema, create and apply a migration in one step:

```bash
npx prisma migrate dev --name describe_your_change
```

This creates a folder under `prisma/migrations/`, runs the SQL against your local database, and regenerates the Prisma Client. Use a descriptive name (e.g. `add_user_token`).

If you already created the migration file manually, apply pending migrations with:

```bash
npx prisma migrate deploy
```

After any schema change, ensure the client is up to date:

```bash
npx prisma generate
```

(`migrate dev` runs this automatically.)

### Quick sync — prototyping only (`db push`)

```bash
npx prisma db push
```

Syncs the schema directly without creating migration files. Fine for early experiments; prefer migrations once you need version history or production deploys.

### Production / Docker

```bash
npx prisma migrate deploy
```

Applies pending migrations without prompts. In Docker, use `migrate deploy` instead of `db push` on startup (see [Database Migrations](#database-migrations) above).

### Typical workflow (add a column)

Example: add `token String?` to the `User` model.

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_user_token`
3. Update your services/controllers to use the new field
4. Restart the dev server: `npm run dev`

### When the database and schema are out of sync

| Situation                                              | Command                                                               |
| ------------------------------------------------------ | --------------------------------------------------------------------- |
| Migration exists but was not applied                   | `npx prisma migrate deploy`                                           |
| Schema changed but no migration yet                    | `npx prisma migrate dev --name your_change`                           |
| Fresh start (drops all data)                           | `npx prisma migrate reset`                                            |
| DB was created with `db push`, switching to migrations | See **B. Baseline** under [Database Migrations](#database-migrations) |

## Running the Project

| Command         | Description                                               |
| --------------- | --------------------------------------------------------- |
| `npm run dev`   | Start in development with hot reload (`ts-node-dev`)      |
| `npm run build` | Compile TypeScript to `dist/`                             |
| `npm start`     | Run the compiled production build (`node dist/server.js`) |

### Development

```bash
npm run dev
```

The server starts on `http://localhost:5001` (or your `PORT`). Verify it's running:

```bash
curl http://localhost:5001/health
# { "success": true, "message": "Backend running" }
```

### Production

```bash
npm run build
npm start
```

## Running with Docker

The project ships with a `Dockerfile` and a `docker-compose.yml` that runs both the API and a PostgreSQL database.

### Prerequisites

- **Docker** and **Docker Compose** installed

### 1. Set the JWT secret

Compose reads `JWT_SECRET` from your shell/`.env`. Add it to `.env` (the database URL is set automatically inside Compose):

```bash
JWT_SECRET="replace-with-a-long-random-secret"
```

> Generate one with: `openssl rand -hex 32`

### 2. Build and start

```bash
docker compose up --build
```

This will:

- Start a `postgres:16-alpine` container (with a persistent `pgdata` volume)
- Build the API image, run `prisma db push` to sync the schema, then start the server
- Expose the API on `http://localhost:5001` and Postgres on `localhost:5432`

Verify it's running:

```bash
curl http://localhost:5001/health
# { "success": true, "message": "Backend running" }
```

### Common commands

| Command                      | Description                              |
| ---------------------------- | ---------------------------------------- |
| `docker compose up --build`  | Build and start all services             |
| `docker compose up -d`       | Start in detached (background) mode      |
| `docker compose logs -f api` | Tail the API logs                        |
| `docker compose down`        | Stop and remove containers               |
| `docker compose down -v`     | Stop and also delete the database volume |

### Building the image only

```bash
docker build -t fitscale-backend .
docker run -p 5001:5001 --env-file .env fitscale-backend
```

> When running the container standalone (without Compose), make sure `DATABASE_URL` points to a reachable database — `localhost` inside a container refers to the container itself, not your host.

## Cold Start with Docker (From Scratch)

Use this when you want to bring the entire stack up from nothing — no containers, no database volume, no cached image layers.

### Prerequisites

- **Docker Desktop is running.**
- The project **compiles** (`npm run typecheck` passes). The Docker image build runs `npm run build` (`tsc`), so any TypeScript error will fail the image build.

### Step 1 — Configure environment variables

Compose reads secrets from `.env`. At minimum you need:

```bash
# Signs access tokens
JWT_SECRET="<long-random-secret>"

# Signs refresh tokens (used by the refresh-token flow)
JWT_REFRESH_SECRET="<another-long-random-secret>"
```

Generate strong values with `openssl rand -hex 32`.

> `DATABASE_URL` is **not** needed here for Docker — Compose overrides it to point at the `db` service automatically.

### Step 2 — Tear down anything from a previous run

```bash
docker compose down -v
```

`-v` also deletes the `pgdata` volume, so the database starts completely empty (a true cold start). Skip `-v` if you want to keep existing data.

### Step 3 — Build the image without cache (optional but thorough)

```bash
docker compose build --no-cache
```

### Step 4 — Start the stack

```bash
docker compose up
```

This will, in order:

1. Start `postgres:16-alpine` and wait until it's healthy
2. Build/start the API container
3. Sync the database schema, then run the server

> Add `-d` to run in the background: `docker compose up -d`

### Step 5 — Verify

```bash
curl http://localhost:5001/health
# { "success": true, "message": "Backend running" }
```

Tail logs if needed:

```bash
docker compose logs -f api
```

### One-liner cold start

```bash
docker compose down -v && docker compose up --build
```

### Notes

- **Migrations vs `db push`:** the `api` service currently runs `npx prisma db push` on startup. Since this project uses migrations (`prisma/migrations/`), change that command in `docker-compose.yml` to `npx prisma migrate deploy` to apply committed migrations instead.
- **`JWT_REFRESH_SECRET` in Compose:** make sure this variable is also passed to the `api` service's `environment:` block in `docker-compose.yml`, otherwise the refresh-token flow fails at runtime inside the container.

## API Endpoints

Base URL: `http://localhost:5001`

| Method | Endpoint             | Description                 | Body                             |
| ------ | -------------------- | --------------------------- | -------------------------------- |
| `GET`  | `/health`            | Health check                | —                                |
| `POST` | `/api/auth/register` | Register a new user         | `{ email, password }`            |
| `POST` | `/api/auth/login`    | Log in, sets `token` cookie | `{ email, password }`            |
| `POST` | `/api/auth/logout`   | Log out, clears cookie      | —                                |
| `GET`  | `/api/users`         | List all users              | —                                |
| `POST` | `/api/users`         | Create a user               | `{ email, passwordHash }`        |
| `GET`  | `/api/workouts`      | List all workouts           | —                                |
| `POST` | `/api/workouts`      | Create a workout            | `{ workoutType, count, userId }` |

`workoutType` must be one of: `PUSHUP`, `SQUAT`, `SITUP`, `PLANK`.

### Postman

A ready-to-import Postman collection is included: [`fitscale.postman_collection.json`](./fitscale.postman_collection.json). Import it via **Postman → Import → File**. The login request automatically captures the auth cookie.

## Project Structure

```
src/
  server.ts            # App entry: middleware, routes, server startup
  lib/
    prisma.ts          # Prisma client (pg adapter)
  routes/
    index.ts           # Mounts module routes under /api
  modules/
    auth/              # register / login / logout
    users/             # user CRUD
    workouts/          # workout create / list
prisma/
  schema.prisma        # Database schema (User, Workout, WorkoutType)
```

## Troubleshooting

- **`secretOrPrivateKey must have a value`** — `JWT_SECRET` is missing from `.env`. Add it and restart the server (`.env` changes don't auto-reload).
- **`HTTP 403` on `localhost:5000` (macOS)** — AirPlay Receiver owns port 5000. Use `PORT=5001` or disable AirPlay Receiver in System Settings → General → AirDrop & Handoff.
- **`EADDRINUSE`** — the port is already in use: `kill -9 $(lsof -tiTCP:5001 -sTCP:LISTEN)`.
- **Prisma can't connect** — confirm PostgreSQL is running and `DATABASE_URL` is correct, then re-run `npx prisma db push`.
