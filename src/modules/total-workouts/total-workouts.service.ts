import { prisma } from "../../lib/prisma";
import { TotalWorkouts, WorkoutType } from "@prisma/client";
import { cacheKeys } from "../../constants";
import { deleteCache, getCache, setCache } from "../../lib/cache";

export const getTotalWorkoutsByUserService = async (
  userId: string,
): Promise<TotalWorkouts[]> => {
  const cachedData = await getCache<TotalWorkouts[]>(
    cacheKeys.totalWorkoutsByUserId(userId),
  );
  if (cachedData) {
    return cachedData;
  }

  const data = await prisma.totalWorkouts.findMany({
    where: { userId },
    orderBy: { workoutType: "asc" },
  });

  if (data.length > 0) {
    await setCache(cacheKeys.totalWorkoutsByUserId(userId), data);
  }

  return data;
};

export const getTotalWorkoutByUserAndTypeService = async (
  userId: string,
  workoutType: WorkoutType,
): Promise<TotalWorkouts | null> => {
  return prisma.totalWorkouts.findUnique({
    where: {
      userId_workoutType: { userId, workoutType },
    },
  });
};

export const getTotalWorkoutByIdService = async (
  userId: string,
  id: number,
): Promise<TotalWorkouts> => {
  const totalWorkout = await prisma.totalWorkouts.findFirst({
    where: { id, userId },
  });

  if (!totalWorkout) {
    throw new Error("Total workout not found");
  }

  return totalWorkout;
};

export const getAllTotalWorkoutsService = async (): Promise<
  TotalWorkouts[]
> => {
  const cachedData = await getCache<TotalWorkouts[]>(
    cacheKeys.allTotalWorkouts,
  );
  if (cachedData) {
    return cachedData;
  }

  const data = await prisma.totalWorkouts.findMany({
    orderBy: { id: "desc" },
  });

  await setCache(cacheKeys.allTotalWorkouts, data);
  return data;
};

export const createTotalWorkoutService = async (
  userId: string,
  workoutType: WorkoutType,
  totalCount: number,
): Promise<TotalWorkouts> => {
  try {
    const totalWorkout = await prisma.totalWorkouts.create({
      data: {
        userId,
        workoutType,
        totalCount,
      },
    });

    await deleteCache(cacheKeys.allTotalWorkouts);
    await deleteCache(cacheKeys.totalWorkoutsByUserId(userId));

    return totalWorkout;
  } catch {
    throw new Error(
      "Total workout already exists for this user and workout type",
    );
  }
};

export const updateTotalWorkoutService = async (
  userId: string,
  id: number,
  workoutType?: WorkoutType,
  totalCount?: number,
): Promise<TotalWorkouts> => {
  const existing = await prisma.totalWorkouts.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("Total workout not found");
  }

  const totalWorkout = await prisma.totalWorkouts.update({
    where: { id },
    data: {
      ...(workoutType !== undefined && { workoutType }),
      ...(totalCount !== undefined && { totalCount }),
    },
  });

  await deleteCache(cacheKeys.allTotalWorkouts);
  await deleteCache(cacheKeys.totalWorkoutsByUserId(userId));

  return totalWorkout;
};

export const deleteTotalWorkoutService = async (
  userId: string,
  id: number,
): Promise<void> => {
  const existing = await prisma.totalWorkouts.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("Total workout not found");
  }

  await prisma.totalWorkouts.delete({
    where: { id },
  });

  await deleteCache(cacheKeys.allTotalWorkouts);
  await deleteCache(cacheKeys.totalWorkoutsByUserId(userId));
};

export const syncTotalWorkoutCountService = async (
  userId: string,
  workoutType: WorkoutType,
): Promise<TotalWorkouts | null> => {
  const result = await prisma.workout.aggregate({
    where: { userId, workoutType },
    _sum: { count: true },
  });

  const totalCount = result._sum.count ?? 0;
  const existing = await getTotalWorkoutByUserAndTypeService(
    userId,
    workoutType,
  );

  if (totalCount === 0) {
    if (existing) {
      await deleteTotalWorkoutService(userId, existing.id);
    }
    return null;
  }

  if (existing) {
    return updateTotalWorkoutService(
      userId,
      existing.id,
      existing.workoutType,
      totalCount,
    );
  }

  return createTotalWorkoutService(userId, workoutType, totalCount);
};
