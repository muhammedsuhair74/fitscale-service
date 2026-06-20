-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('ADMIN', 'TRAINER', 'USER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRoles" NOT NULL DEFAULT 'USER';
