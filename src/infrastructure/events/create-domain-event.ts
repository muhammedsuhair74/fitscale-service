import { AggregateType } from "./contracts/aggregate-type";
import { DomainEvent } from "./contracts/domain-event";
import { EventType } from "./contracts/event-type";
import { IdGenerator } from "./eventCollaborators/IdGenerator";
import { Clock } from "./eventCollaborators/Clock";

interface CreateEventParams<T> {
  correlationId: string;
  causationId?: string | null;
  eventType: EventType;
  aggregateId: string;
  aggregateType: AggregateType;
  aggregateVersion: number;
  payload: T;
  headers: Record<string, string>;
  correlationKey?: string;
}

class EventFactory {
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;

  constructor({
    idGenerator,
    clock,
  }: {
    idGenerator: IdGenerator;
    clock: Clock;
  }) {
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  create<T>(params: CreateEventParams<T>): DomainEvent<T> {
    const event: DomainEvent<T> = {
      eventId: this.idGenerator.generate(),
      correlationId: params.correlationId,
      causationId: params.causationId ?? undefined,
      eventType: params.eventType,
      aggregateId: params.aggregateId,
      aggregateType: params.aggregateType,
      aggregateVersion: params.aggregateVersion,
      occurredAt: this.clock.now(),
      payload: params.payload,
      headers: params.headers,
      correlationKey: params.correlationKey || this.idGenerator.generate(),
    };

    return event;
  }
}

export default EventFactory;
