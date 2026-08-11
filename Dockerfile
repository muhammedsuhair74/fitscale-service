# ---- Build stage ----
FROM node:20-slim AS builder

RUN apt-get update -y \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# prisma.config.ts requires DATABASE_URL even for `prisma generate` (no DB connection)
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fitscale?schema=public
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:20-slim AS runner

RUN apt-get update -y \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

# Placeholder for generate; docker-compose overrides this at runtime
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fitscale?schema=public
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
RUN npm ci --omit=dev

# Prisma CLI needs schema + config (datasource.url) for migrate deploy
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy compiled output from the build stage
COPY --from=builder /app/dist ./dist

EXPOSE 5001

CMD ["node", "dist/server.js"]
