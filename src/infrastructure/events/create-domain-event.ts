import { AggregateType } from "./contracts/aggregate-type";
import { DomainEvent } from "./contracts/domain-event";
import { EventType } from "./contracts/event-type";

// export function createDomainEvent<T>(
//   params: CreateDomainEventParams<T>,
// ): DomainEvent<T> {
//   return {
//     eventId: crypto.randomUUID(),
//     occurredAt: new Date(),
//     correlationId: crypto.randomUUID(),
//     causationId: params.causationId,
//     eventType: params.eventType,
//     aggregateId: params.aggregateId,
//     aggregateType: params.aggregateType,
//     aggregateVersion: params.aggregateVersion,
//     payload: params.payload,
//     headers: params.headers,
//     correlationKey: params.correlationKey || crypto.randomUUID(),
//   };
// }

interface CreateEventParams<T> {
  correlationId: string;
  causationId: string;
  eventType: EventType;
  aggregateId: string;
  aggregateType: AggregateType;
  aggregateVersion: number;
  payload: T;
  headers: Record<string, string>;
  correlationKey?: string;
}

interface Clock {
  now(): Date;
}
interface IdGenerator {
  generate(): string;
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

  async create<T>(params: CreateEventParams<T>): Promise<DomainEvent<T>> {
    const event: DomainEvent<T> = {
      eventId: this.idGenerator.generate(),
      correlationId: params.correlationId,
      causationId: params.causationId,
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
