import { AggregateType } from "./aggregate-type";
import { EventType } from "./event-type";

export interface CreateDomainEventParams<T> {
  readonly causationId?: string;
  readonly eventType: EventType;
  readonly aggregateId: string;
  readonly aggregateType: AggregateType;
  readonly aggregateVersion: number;
  readonly payload: T;
  readonly headers?: Record<string, unknown>;
  readonly correlationKey?: string;
}
