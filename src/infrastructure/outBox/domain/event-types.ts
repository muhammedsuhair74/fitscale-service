export const EventTypes = {
  WORKOUT_CREATED: "workout.created",
  WORKOUT_UPDATED: "workout.updated",
  WORKOUT_DELETED: "workout.deleted",
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];
