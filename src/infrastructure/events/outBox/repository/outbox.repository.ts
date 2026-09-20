import {
  EventSourceTypes,
  EventTypes,
  OutBoxStatus,
  Prisma,
} from "@prisma/client";
import { DomainEvent } from "../../contracts/domain-event";
import { EventType } from "../../contracts/event-type";
import { EventStore } from "../../eventStores/eventStore";
import { TransactionContext } from "../../../../lib/transactionService";
import { prisma } from "../../../../lib/prisma";
import { EVENT_ROUTING_KEYS } from "../../../../lib/constants";

type OutboxRow = Prisma.OutboxGetPayload<Record<string, never>>;

const DATABASE_EVENT_TYPES: Record<EventType, EventTypes> = {
  [EventType.WORKOUT_CREATED]: EventTypes.WORKOUT_CREATED,
  [EventType.WORKOUT_UPDATED]: EventTypes.WORKOUT_UPDATED,
  [EventType.WORKOUT_DELETED]: EventTypes.WORKOUT_DELETED,
  [EventType.TOTAL_WORKOUT_UPDATED]: EventTypes.TOTAL_WORKOUT_UPDATED,
  [EventType.BADGE_AWARDED]: EventTypes.BADGE_AWARDED,
};

export class OutboxRepository implements EventStore {
  async save({
    event,
    producer,
    sourceService,
  }: {
    event: DomainEvent<unknown>;
    producer: EventSourceTypes;
    sourceService: EventSourceTypes;
  }): Promise<void> {
    await prisma.outbox.create({
      data: {
        id: crypto.randomUUID(),
        eventId: event.eventId,
        eventType: DATABASE_EVENT_TYPES[event.eventType],
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        aggregateVersion: event.aggregateVersion,
        correlationId: event.correlationId,
        causationId: event.causationId,
        payload: event.payload as Prisma.InputJsonValue,
        status: OutBoxStatus.PENDING,
        producer,
        routingKey: EVENT_ROUTING_KEYS[event.eventType],
        sourceService,
      },
    });
  }

  async saveInTransaction({
    transactionContext,
    event,
    producer,
    sourceService,
  }: {
    transactionContext: TransactionContext;
    event: DomainEvent<unknown>;
    producer: EventSourceTypes;
    sourceService: EventSourceTypes;
  }): Promise<void> {
    await transactionContext.outbox.create({
      data: {
        eventId: event.eventId,
        eventType: DATABASE_EVENT_TYPES[event.eventType],
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        aggregateVersion: event.aggregateVersion,
        correlationId: event.correlationId,
        causationId: event.causationId,
        payload: event.payload as Prisma.InputJsonValue,
        status: OutBoxStatus.PENDING,
        producer,
        routingKey: EVENT_ROUTING_KEYS[event.eventType],
        sourceService,
      },
    });
  }

  async findPending(
    transactionContext: TransactionContext,
    batchSize: number,
  ): Promise<OutboxRow[]> {
    return transactionContext.outbox.findMany({
      where: {
        status: OutBoxStatus.PENDING,
      },
      take: batchSize,
    });
  }

  async markPublished(
    transactionContext: TransactionContext,
    id: string,
  ): Promise<void> {
    await transactionContext.outbox.update({
      where: { id },
      data: {
        status: OutBoxStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async markFailed(
    transactionContext: TransactionContext,
    id: string,
    reason: string,
  ): Promise<void> {
    await transactionContext.outbox.update({
      where: { id },
      data: {
        status: OutBoxStatus.FAILED,
        lastError: reason,
      },
    });
  }

  async incrementRetry(
    transactionContext: TransactionContext,
    id: string,
    nextRetryAt: Date,
    reason: string,
  ): Promise<void> {
    await transactionContext.outbox.update({
      where: { id },
      data: {
        status: OutBoxStatus.PROCESSING,
        nextRetryAt,
        lastError: reason,
        retryCount: { increment: 1 },
      },
    });
  }
}
