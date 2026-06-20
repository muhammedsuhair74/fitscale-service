import { prisma } from "../../lib/prisma";
import { Workout, WorkoutType } from "@prisma/client";

export const getWorkoutsService = async (
  userId: string,
): Promise<Workout[]> => {
  return prisma.workout.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const createWorkoutService = async (
  userId: string,
  workoutType: WorkoutType,
  count: number,
): Promise<Workout> => {
  return prisma.workout.create({
    data: {
      workoutType,
      count,
      userId,
    },
  });
};
