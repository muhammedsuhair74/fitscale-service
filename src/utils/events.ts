import { randomUUID } from "node:crypto";
import { DomainEvent } from "../infrastructure/outBox/outbox.types";

export enum EventTypes {
  WORKOUT_CREATED = "WORKOUT_CREATED",
  WORKOUT_UPDATED = "WORKOUT_UPDATED",
  WORKOUT_DELETED = "WORKOUT_DELETED",
}

export const generateEventPayload = <T>({
  aggregateId,
  aggregateType,
  aggregateVersion,
  payload,
  eventType,
  headers,
}: Omit<
  DomainEvent<T>,
  "eventId" | "correlationId" | "occurredAt"
>): DomainEvent<T> => {
  return {
    eventId: randomUUID(),
    correlationId: randomUUID(),
    occurredAt: new Date(),
    eventType,
    aggregateId,
    aggregateType,
    aggregateVersion,
    headers,
    payload,
  };
};
