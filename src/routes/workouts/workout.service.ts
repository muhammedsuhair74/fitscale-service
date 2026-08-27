import { EventSourceTypes, Prisma, Workout, WorkoutType } from "@prisma/client";
import {
  WorkoutCreatedEventPayload,
  workoutRepository,
} from "./workout.repository";
import { redis } from "../../lib/redis";
import { cacheKeys, WorkoutEventType } from "../../lib/constants";
import { getCache, setCache } from "../../lib/cache";
import {
  publishWorkoutCreated,
  publishWorkoutDeleted,
  publishWorkoutUpdated,
} from "../../events/publishers/workout.publisher";
import { invalidateWorkoutCaches } from "../../infrastructure/redis/invalidate";
import {
  AggregateType,
  EventFactory,
  EventType,
} from "../../infrastructure/events";
import {
  TransactionContext,
  TransactionService,
} from "../../lib/transactionService";
import { createEventFactory, createEventStore } from "../../app/dependencies";

export const invalidateWorkoutCachesKeys = (userId: string) => [
  cacheKeys.allWorkouts,
  cacheKeys.workoutsByUserId(userId),
];

export const createWorkoutService = async (
  userId: string,
  workoutType: WorkoutType,
  count: number,
): Promise<Workout> => {
  const transactionService = new TransactionService();

  const workout = await transactionService.execute(
    async (transactionContext: TransactionContext) => {
      const eventStore = createEventStore(transactionContext);
      const eventFactory = createEventFactory;
      const workoutData = await workoutRepository.create(
        userId,
        workoutType,
        count,
        transactionContext,
      );

      const event = eventFactory.create<WorkoutCreatedEventPayload>({
        correlationId: workoutData.id,
        causationId: workoutData.id,
        aggregateType: AggregateType.WORKOUT,
        aggregateId: workoutData.id,
        aggregateVersion: 1,
        payload: { userId, workoutType, count },
        eventType: EventType.WORKOUT_CREATED,
      });

      await eventStore.save({
        transactionContext,
        event,
        producer: EventSourceTypes.WORKOUT_CREATED,
        sourceService: EventSourceTypes.WORKOUT_CREATED,
      });

      return workoutData;
    },
  );

  if (!workout) throw new Error("Workout not found");

  await invalidateWorkoutCaches(invalidateWorkoutCachesKeys(userId));
  return workout;
};

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
  await invalidateWorkoutCaches(invalidateWorkoutCachesKeys(userId));
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
  await invalidateWorkoutCaches(invalidateWorkoutCachesKeys(userId));
  publishWorkoutDeleted(
    existingWorkout.id,
    existingWorkout.userId,
    existingWorkout.workoutType,
  );
};
