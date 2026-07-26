-- CreateEnum
CREATE TYPE "OutBoxStatus" AS ENUM ('PENDING', 'INPROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "WorkoutOutbox" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "correlationId" TEXT,
    "causationId" TEXT,
    "payload" JSONB NOT NULL,
    "status" "OutBoxStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,

    CONSTRAINT "WorkoutOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TotalWorkoutIdempotency" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TotalWorkoutIdempotency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutOutbox_eventId_key" ON "WorkoutOutbox"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "TotalWorkoutIdempotency_eventId_key" ON "TotalWorkoutIdempotency"("eventId");
