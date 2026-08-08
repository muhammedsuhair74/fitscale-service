/*
  Warnings:

  - Changed the type of `aggregateType` on the `outbox` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AggregateType" AS ENUM ('USER', 'WORKOUT', 'BADGE', 'NOTIFICATION');

-- AlterEnum
ALTER TYPE "EventSourceTypes" ADD VALUE 'WORKOUT_UPDATED';

-- AlterTable
ALTER TABLE "outbox" DROP COLUMN "aggregateType",
ADD COLUMN     "aggregateType" "AggregateType" NOT NULL;
