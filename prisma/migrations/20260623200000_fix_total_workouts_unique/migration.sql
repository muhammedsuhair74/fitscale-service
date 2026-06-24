-- DropIndex
DROP INDEX "TotalWorkouts_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "TotalWorkouts_userId_workoutType_key" ON "TotalWorkouts"("userId", "workoutType");
