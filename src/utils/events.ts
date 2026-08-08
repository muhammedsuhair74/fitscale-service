import { randomUUID } from "node:crypto";
import { DomainEvent } from "../infrastructure/events/contracts/domain-event";

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
    correlationKey: randomUUID(),
    eventType,
    aggregateId,
    aggregateType,
    aggregateVersion,
    headers,
    payload: JSON.parse(JSON.stringify(payload)),
  };
};
