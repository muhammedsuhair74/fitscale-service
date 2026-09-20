/*
  Warnings:

  - You are about to drop the column `headers` on the `outbox` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventId,consumerName]` on the table `ProcessedEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `consumerName` to the `ProcessedEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AggregateType" ADD VALUE 'TOTAL_WORKOUT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventSourceTypes" ADD VALUE 'TOTAL_WORKOUT';
ALTER TYPE "EventSourceTypes" ADD VALUE 'BADGE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventTypes" ADD VALUE 'TOTAL_WORKOUT_UPDATED';
ALTER TYPE "EventTypes" ADD VALUE 'BADGE_AWARDED';

-- DropIndex
DROP INDEX "ProcessedEvent_eventId_key";

-- AlterTable
ALTER TABLE "ProcessedEvent" ADD COLUMN     "consumerName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "outbox" DROP COLUMN "headers";

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedEvent_eventId_consumerName_key" ON "ProcessedEvent"("eventId", "consumerName");
