import { Workout, WorkoutType } from "@prisma/client";
import { workoutRepository } from "../repositories/workout.repository";
import { redis } from "../lib/redis";
import { cacheKeys } from "../lib/constants";
import { getCache, setCache } from "../lib/cache";
import {
  publishWorkoutCreated,
  publishWorkoutDeleted,
  publishWorkoutUpdated,
} from "./workout.producer";

async function invalidateWorkoutCaches(userId: string) {
  await redis.del(cacheKeys.allWorkouts);
  await redis.del(cacheKeys.workoutsByUserId(userId));
}

export const getWorkoutsService = async (
  userId: string,
): Promise<Workout[]> => {
  const cachedData = await getCache<Workout[]>(
    cacheKeys.workoutsByUserId(userId),
  );
  if (cachedData) {
    return cachedData;
  }

  const data = await workoutRepository.findManyByUserId(userId);
  await setCache(cacheKeys.workoutsByUserId(userId), data);
  return data;
};

export const getWorkoutByIdService = async (
  userId: string,
  id: string,
): Promise<Workout> => {
  const workout = await workoutRepository.findFirstByIdAndUserId(id, userId);
  if (!workout) throw new Error("Workout not found");
  return workout;
};

export const createWorkoutService = async (
  userId: string,
  workoutType: WorkoutType,
  count: number,
): Promise<Workout> => {
  const workout = await workoutRepository.create({ userId, workoutType, count });
  await invalidateWorkoutCaches(userId);
  publishWorkoutCreated(workout.id, workout.userId, workout.workoutType);
  return workout;
};

export const getAllWorkoutsService = async (): Promise<Workout[]> => {
  const cachedData = await redis.get(cacheKeys.allWorkouts);
  if (cachedData) {
    return JSON.parse(cachedData) as Workout[];
  }

  const data = await workoutRepository.findMany();
  await redis.set(cacheKeys.allWorkouts, JSON.stringify(data), { EX: 60 });
  return data;
};

export const editWorkoutService = async (
  userId: string,
  id: string,
  workoutType: WorkoutType,
  count: number,
): Promise<Workout> => {
  const existingWorkout = await workoutRepository.findFirstByIdAndUserId(
    id,
    userId,
  );
  if (!existingWorkout) {
    throw new Error("Workout not found");
  }

  const workout = await workoutRepository.update(id, { workoutType, count });
  await invalidateWorkoutCaches(userId);
  publishWorkoutUpdated(
    workout.id,
    workout.userId,
    workout.workoutType,
    existingWorkout.workoutType,
  );
  return workout;
};

export const deleteWorkoutService = async (
  userId: string,
  id: string,
): Promise<void> => {
  const existingWorkout = await workoutRepository.findFirstByIdAndUserId(
    id,
    userId,
  );
  if (!existingWorkout) {
    throw new Error("Workout not found");
  }

  await workoutRepository.delete(id);
  await invalidateWorkoutCaches(userId);
  publishWorkoutDeleted(
    existingWorkout.id,
    existingWorkout.userId,
    existingWorkout.workoutType,
  );
};
