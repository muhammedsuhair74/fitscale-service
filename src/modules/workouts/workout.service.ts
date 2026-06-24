import { prisma } from "../../lib/prisma";
import { Workout, WorkoutType } from "@prisma/client";
import { redis } from "../../lib/redis";
import { cacheKeys } from "../../constants";
import { getCache, setCache } from "../../lib/cache";
import { publishWorkoutCreated } from "./workout.producer";
import { syncTotalWorkoutCountService } from "../total-workouts/total-workouts.service";

export const getWorkoutsService = async (
  userId: string,
): Promise<Workout[]> => {
  const cachedData = await getCache(cacheKeys.workoutsByUserId(userId));
  if (cachedData) {
    console.log("Redis Hit");
    return cachedData as Workout[];
  }

  console.log("Redis Miss");

  const data = await prisma.workout.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  await setCache(cacheKeys.workoutsByUserId(userId), data);
  return data;
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
  await redis.del(cacheKeys.workoutsByUserId(userId));
  await syncTotalWorkoutCountService(userId, workoutType);
  await publishWorkoutCreated(workout.id, workout.userId);
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
  const existingWorkout = await prisma.workout.findUnique({
    where: { id },
  });

  if (!existingWorkout) {
    throw new Error("Workout not found");
  }

  const workout = await prisma.workout.update({
    where: { id },
    data: { workoutType, count },
  });

  await redis.del(cacheKeys.allWorkouts);
  await redis.del(cacheKeys.workoutsByUserId(existingWorkout.userId));

  await syncTotalWorkoutCountService(existingWorkout.userId, workoutType);

  if (existingWorkout.workoutType !== workoutType) {
    await syncTotalWorkoutCountService(
      existingWorkout.userId,
      existingWorkout.workoutType,
    );
  }

  return workout;
};

export const deleteWorkoutService = async (id: string): Promise<void> => {
  const existingWorkout = await prisma.workout.findUnique({
    where: { id },
  });

  if (!existingWorkout) {
    throw new Error("Workout not found");
  }

  await prisma.workout.delete({
    where: { id },
  });

  await redis.del(cacheKeys.allWorkouts);
  await redis.del(cacheKeys.workoutsByUserId(existingWorkout.userId));
  await syncTotalWorkoutCountService(
    existingWorkout.userId,
    existingWorkout.workoutType,
  );
};
