import { AggregateType } from "./aggregate-type";
import { EventType } from "./event-type";

export interface DomainEvent<T> {
  readonly causationId?: string;
  readonly eventType: EventType;
  readonly aggregateId: string;
  readonly aggregateType: AggregateType;
  readonly aggregateVersion: number;
  readonly payload: T;

  readonly correlationId: string;
  readonly eventId: string;
  readonly occurredAt: Date;

  readonly headers?: Record<string, unknown>; // Request / transport headers for the event
}
