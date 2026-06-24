-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('BRONZE_PUSHUP', 'SILVER_PUSHUP', 'GOLD_PUSHUP', 'BRONZE_SQUAT', 'SILVER_SQUAT', 'GOLD_SQUAT', 'BRONZE_SITUP', 'SILVER_SITUP', 'GOLD_SITUP', 'BRONZE_PLANK', 'SILVER_PLANK', 'GOLD_PLANK');

-- CreateTable
CREATE TABLE "Badge" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeType" "BadgeType" NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Badge_userId_badgeType_key" ON "Badge"("userId", "badgeType");

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
