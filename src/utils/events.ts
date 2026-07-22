import { uuidv4 } from "zod";
import { DomainEvent, EventType } from "../outBox/outbox.types";

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
}: Omit<
  DomainEvent<T>,
  "eventId" | "correlationId" | "occurredAt"
>): DomainEvent<T> => {
  return {
    eventId: uuidv4().toString(),
    correlationId: uuidv4().toString(),
    occurredAt: new Date(),
    eventType,
    aggregateId,
    aggregateType,
    aggregateVersion,
    payload,
  };
};
