import { prisma } from "../../lib/prisma";
import { Workout, WorkoutType } from "@prisma/client";
import { redis } from "../../lib/redis";
import { cacheKeys } from "../../constants";

export const getWorkoutsService = async (
  userId: string,
): Promise<Workout[]> => {
  return prisma.workout.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const getWorkoutByIdService = async (
  userId: string,
  id: string,
): Promise<Workout | null> => {
  const workout = await prisma.workout.findUnique({
    where: { id, userId },
  });

  if (!workout) throw new Error("Workout not found");

  return workout || null;
};

export const createWorkoutService = async (
  userId: string,
  workoutType: WorkoutType,
  count: number,
): Promise<Workout> => {
  const workout = await prisma.workout.create({
    data: {
      workoutType,
      count,
      userId,
    },
  });
  await redis.del(cacheKeys.allWorkouts);
  return workout;
};

export const getAllWorkoutsService = async (): Promise<Workout[]> => {
  const cachedData = await redis.get(cacheKeys.allWorkouts);
  if (cachedData) {
    console.log("Redis Hit");
    return JSON.parse(cachedData) as Workout[];
  }

  console.log("Redis Miss");

  const data = await prisma.workout.findMany();
  await redis.set(cacheKeys.allWorkouts, JSON.stringify(data), { EX: 60 });

  return data;
};

export const editWorkoutService = async (
  id: string,
  workoutType: WorkoutType,
  count: number,
): Promise<Workout> => {
  const workout = await prisma.workout.update({
    where: { id },
    data: { workoutType, count },
  });
  await redis.del(cacheKeys.allWorkouts);
  return workout;
};
