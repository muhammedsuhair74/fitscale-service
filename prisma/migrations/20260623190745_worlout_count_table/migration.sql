-- CreateTable
CREATE TABLE "TotalWorkouts" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutType" "WorkoutType" NOT NULL,
    "totalCount" INTEGER NOT NULL,

    CONSTRAINT "TotalWorkouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TotalWorkouts_userId_key" ON "TotalWorkouts"("userId");
