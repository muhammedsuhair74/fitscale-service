/*
  Warnings:

  - Changed the type of `eventType` on the `outbox` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EventTypes" AS ENUM ('WORKOUT_CREATED', 'WORKOUT_UPDATED', 'WORKOUT_DELETED');

-- AlterTable
ALTER TABLE "outbox" DROP COLUMN "eventType",
ADD COLUMN     "eventType" "EventTypes" NOT NULL;
