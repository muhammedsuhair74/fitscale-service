import { AggregateType } from "./aggregate-type";
import { EVENT_TYPES } from "./event-type";

export interface CreateDomainEventParams<T> {
  readonly causationId?: string;
  readonly eventType: EVENT_TYPES;
  readonly aggregateId: string;
  readonly aggregateType: AggregateType;
  readonly aggregateVersion: number;
  readonly payload: T;
}
