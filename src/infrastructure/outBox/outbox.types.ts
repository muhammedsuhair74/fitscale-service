import { WorkoutEventType } from "../../lib/constants";

export const EVENT_TYPES = {
  WORKOUT_CREATED: "WORKOUT_CREATED",
  WORKOUT_UPDATED: "WORKOUT_UPDATED",
  BADGE_AWARDED: "BADGE_AWARDED",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export interface DomainEvent<T> {
  eventId: string; // To track event
  correlationId: string; // will be same when a single operation generates multiple events, all events of a single operation will have the same correlationId,mostly added by the server level middleware
  causationId?: string; // Id of the event that caused this event to be generated
  eventType: EventType; // like WORKOUT_CREATED, WORKOUT_UPDATED, BADGE_AWARDED
  aggregateId: string; // Id of the aggregate that the event belongs to like workoutId, badgeId, etc. It is root to bissiness logic
  aggregateType: string; // Type of the aggregate that the event belongs to, if aggregateId is qwqeqw , what of something is qwqeqw ? aggregateType will give the answer to that
  aggregateVersion: number; // Version of the aggregate that the event belongs to, which is used in idempotency check
  occurredAt: Date; // Timestamp of the event
  payload: T; // Payload of the event
}

export interface WorkoutEventPayload<T> {
  eventType: WorkoutEventType;
  payload: T;
}
