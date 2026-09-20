import { WorkoutType } from "@prisma/client";
import { UserRoles } from "@prisma/client";
import { EventType } from "../infrastructure/events/contracts/event-type";

export const WORKOUT_CACHE_TTL_SECONDS = 60;

export const cacheKeys = {
  allWorkouts: "all-workouts",
  allUsers: "all-users",
  workoutById: (id: string) => `workout-${id}`,
  workoutsByUserId: (userId: string) => `workouts-by-user-${userId}`,
  workoutsByType: (type: WorkoutType) => `workouts-by-type-${type}`,

  userById: (id: string) => `user-${id}`,
  userByEmail: (email: string) => `user-by-email-${email}`,
  usersByRole: (role: UserRoles) => `users-by-role-${role}`,

  allTotalWorkouts: "all-total-workouts",
  totalWorkoutsByUserId: (userId: string) => `total-workouts-by-user-${userId}`,
};

export const RABBITMQ_EXCHANGES = {
  DOMAIN_EVENTS: "fitscale.events",
  RETRY_RETURN: "fitscale.retry-return",
};

export enum EventRoutingKeys {
  WORKOUT_CREATED = "workout.created",
  WORKOUT_UPDATED = "workout.updated",
  WORKOUT_DELETED = "workout.deleted",
  TOTAL_WORKOUT_UPDATED = "total-workout.updated",
  BADGE_AWARDED = "badge.awarded",
}

export const EVENT_ROUTING_KEYS: Record<EventType, EventRoutingKeys> = {
  [EventType.WORKOUT_CREATED]: EventRoutingKeys.WORKOUT_CREATED,
  [EventType.WORKOUT_UPDATED]: EventRoutingKeys.WORKOUT_UPDATED,
  [EventType.WORKOUT_DELETED]: EventRoutingKeys.WORKOUT_DELETED,
  [EventType.TOTAL_WORKOUT_UPDATED]: EventRoutingKeys.TOTAL_WORKOUT_UPDATED,
  [EventType.BADGE_AWARDED]: EventRoutingKeys.BADGE_AWARDED,
};

export const WORKOUT_CREATED_QUEUE_NAMES = {
  NOTIFICATIONS: "notifications",
  TOTAL_WORKOUTS_SYNC: "total-workouts-sync",
  BADGE_EVALUATION: "badge-evaluation",
};

export const BADGE_RETRY_QUEUE_NAMES = {
  BADGE_RETRY_2_SECONDS: {
    QUEUE_NAME: "badge-retry-2-seconds",
    TTL: 2000,
  },
  BADGE_RETRY_5_SECONDS: {
    QUEUE_NAME: "badge-retry-5-seconds",
    TTL: 5000,
  },
  BADGE_RETRY_10_SECONDS: {
    QUEUE_NAME: "badge-retry-10-seconds",
    TTL: 10000,
  },
  BADGE_RETRY_30_SECONDS: {
    QUEUE_NAME: "badge-retry-30-seconds",
    TTL: 30000,
  },
  BADGE_RETRY_60_SECONDS: {
    QUEUE_NAME: "badge-retry-60-seconds",
    TTL: 60000,
  },
  BADGE_RETRY_120_SECONDS: {
    QUEUE_NAME: "badge-retry-120-seconds",
    TTL: 120000,
  },
};

export const RABBITMQ_QUEUE_NAMES = {
  ...WORKOUT_CREATED_QUEUE_NAMES,
};

export enum WorkoutEventType {
  CREATED = "created",
  UPDATED = "updated",
  DELETED = "deleted",
}

export enum WorkoutOutBoxStatusTypes {
  PENDING = "pending",
  INPROGRESS = "inprogress",
  DONE = "done",
}

export interface eventPayload<T> {
  event: WorkoutEventType;
  payload: T;
}
