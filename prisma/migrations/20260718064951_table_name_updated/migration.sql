/*
  Warnings:

  - You are about to drop the `TotalWorkoutIdempotency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutOutbox` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TotalWorkoutIdempotency";

-- DropTable
DROP TABLE "WorkoutOutbox";

-- CreateTable
CREATE TABLE "outbox" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "aggregateId" INTEGER NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateVersion" INTEGER NOT NULL,
    "correlationId" TEXT,
    "publishedBy" TEXT,
    "causationId" TEXT,
    "nextRetryAt" TIMESTAMP(3),
    "metadata" JSONB,
    "payload" JSONB NOT NULL,
    "status" "OutBoxStatus" NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "outbox_eventId_key" ON "outbox"("eventId");

-- CreateIndex
CREATE INDEX "outbox_status_idx" ON "outbox"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedEvent_eventId_key" ON "ProcessedEvent"("eventId");
