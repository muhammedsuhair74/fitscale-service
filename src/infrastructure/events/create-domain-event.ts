import crypto from "node:crypto";

import { CreateDomainEventParams } from "./contracts/create-domain-event-params";
import { DomainEvent } from "./contracts/domain-event";

export function createDomainEvent<T>(
  params: CreateDomainEventParams<T>,
): DomainEvent<T> {
  return {
    eventId: crypto.randomUUID(),
    correlationId: crypto.randomUUID(),
    causationId: params.causationId,
    eventType: params.eventType,
    aggregateId: params.aggregateId,
    aggregateType: params.aggregateType,
    aggregateVersion: params.aggregateVersion,
    occurredAt: new Date(),
    payload: params.payload,
  };
}
