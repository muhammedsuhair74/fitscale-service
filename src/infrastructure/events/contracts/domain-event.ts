import { AggregateType } from "./aggregate-type";
import { EVENT_TYPES } from "./event-type";

export interface DomainEvent<T> {
  readonly causationId?: string;
  readonly eventType: EVENT_TYPES;
  readonly aggregateId: string;
  readonly aggregateType: AggregateType;
  readonly aggregateVersion: number;
  readonly payload: T;

  readonly correlationId: string;
  readonly eventId: string;
  readonly occurredAt: Date;

  readonly headers?: Object; // Request / transport headers for the event
  readonly correlationKey?: string; // To track event
}
