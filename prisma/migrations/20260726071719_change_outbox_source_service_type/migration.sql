/*
  Warnings:

  - Changed the type of `sourceService` on the `outbox` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "outbox" DROP COLUMN "sourceService",
ADD COLUMN     "sourceService" "EventSourceTypes" NOT NULL;

-- CreateIndex
CREATE INDEX "outbox_status_nextRetryAt_idx" ON "outbox"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "outbox_eventId_idx" ON "outbox"("eventId");

-- CreateIndex
CREATE INDEX "outbox_aggregateId_aggregateVersion_idx" ON "outbox"("aggregateId", "aggregateVersion");
