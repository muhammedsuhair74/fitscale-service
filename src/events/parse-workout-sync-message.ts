import { WorkoutType } from "@prisma/client";

const WORKOUT_TYPES = new Set<string>(Object.values(WorkoutType));

export type WorkoutSyncMessage = {
  userId: string;
  workoutType: WorkoutType;
  previousWorkoutType?: WorkoutType;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWorkoutType(value: unknown): value is WorkoutType {
  return typeof value === "string" && WORKOUT_TYPES.has(value);
}

export function parseWorkoutSyncMessage(
  message: unknown,
): WorkoutSyncMessage | null {
  if (!isRecord(message)) return null;

  const fields = isRecord(message.payload) ? message.payload : message;
  const userId = fields.userId;
  const workoutType = fields.workoutType;

  if (typeof userId !== "string" || userId.length === 0) return null;
  if (!isWorkoutType(workoutType)) return null;

  const previousWorkoutType = fields.previousWorkoutType;

  return {
    userId,
    workoutType,
    ...(isWorkoutType(previousWorkoutType) && { previousWorkoutType }),
  };
}
