/*
  Warnings:

  - The values [INPROGRESS,DONE] on the enum `OutBoxStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `publishedBy` on the `outbox` table. All the data in the column will be lost.
  - Added the required column `producer` to the `outbox` table without a default value. This is not possible if the table is not empty.
  - Added the required column `routingKey` to the `outbox` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceService` to the `outbox` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OutBoxStatus_new" AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED');
ALTER TABLE "outbox" ALTER COLUMN "status" TYPE "OutBoxStatus_new" USING ("status"::text::"OutBoxStatus_new");
ALTER TYPE "OutBoxStatus" RENAME TO "OutBoxStatus_old";
ALTER TYPE "OutBoxStatus_new" RENAME TO "OutBoxStatus";
DROP TYPE "public"."OutBoxStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "outbox" DROP COLUMN "publishedBy",
ADD COLUMN     "headers" JSONB,
ADD COLUMN     "producer" TEXT NOT NULL,
ADD COLUMN     "routingKey" TEXT NOT NULL,
ADD COLUMN     "sourceService" TEXT NOT NULL;
