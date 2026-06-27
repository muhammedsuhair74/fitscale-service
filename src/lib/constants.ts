import { WorkoutType } from "@prisma/client";
import { UserRoles } from "@prisma/client";

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

export const RABBITMQ_EXCHANGE = "workout-created-exchange";

export const RABBITMQ_QUEUE_NAMES = {
  NOTIFICATIONS: "notifications",
  TOTAL_WORKOUTS_SYNC: "total-workouts-sync",
  BADGE_EVALUATION: "badge-evaluation",
};

export type WorkoutEventType = "created" | "updated" | "deleted";

export interface WorkoutEventPayload {
  event: WorkoutEventType;
  workoutId: string;
  userId: string;
  workoutType: WorkoutType;
  previousWorkoutType?: WorkoutType;
}
