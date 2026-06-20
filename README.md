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
npx prisma db push      # sync the schema to your database
```

> Prefer versioned migrations? Use `npx prisma migrate dev --name init` instead of `db push`.

## Running the Project

| Command | Description |
| --- | --- |
| `npm run dev` | Start in development with hot reload (`ts-node-dev`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled production build (`node dist/server.js`) |

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

| Command | Description |
| --- | --- |
| `docker compose up --build` | Build and start all services |
| `docker compose up -d` | Start in detached (background) mode |
| `docker compose logs -f api` | Tail the API logs |
| `docker compose down` | Stop and remove containers |
| `docker compose down -v` | Stop and also delete the database volume |

### Building the image only

```bash
docker build -t fitscale-backend .
docker run -p 5001:5001 --env-file .env fitscale-backend
```

> When running the container standalone (without Compose), make sure `DATABASE_URL` points to a reachable database — `localhost` inside a container refers to the container itself, not your host.

## API Endpoints

Base URL: `http://localhost:5001`

| Method | Endpoint | Description | Body |
| --- | --- | --- | --- |
| `GET` | `/health` | Health check | — |
| `POST` | `/api/auth/register` | Register a new user | `{ email, password }` |
| `POST` | `/api/auth/login` | Log in, sets `token` cookie | `{ email, password }` |
| `POST` | `/api/auth/logout` | Log out, clears cookie | — |
| `GET` | `/api/users` | List all users | — |
| `POST` | `/api/users` | Create a user | `{ email, passwordHash }` |
| `GET` | `/api/workouts` | List all workouts | — |
| `POST` | `/api/workouts` | Create a workout | `{ workoutType, count, userId }` |

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
