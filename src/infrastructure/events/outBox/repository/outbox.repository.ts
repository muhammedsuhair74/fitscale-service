import {
  EventSourceTypes,
  OutBoxStatus,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import { DomainEvent } from "../../contracts/domain-event";
import { EventStore } from "../../eventStores/eventStore";
import { TransactionContext } from "../../../../lib/transactionService";

type OutboxRow = Prisma.OutboxGetPayload<Record<string, never>>;

export class OutboxRepository implements EventStore {
  constructor(private readonly prisma: PrismaClient) {}

  async save({
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
    await transactionContext.prisma.outbox.create({
      data: {
        eventId: event.eventId,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        aggregateVersion: event.aggregateVersion,
        correlationId: event.correlationId,
        causationId: event.causationId,
        payload: event.payload as Prisma.InputJsonValue,
        status: OutBoxStatus.PENDING,
        producer,
        routingKey: event.eventType,
        sourceService,
      },
    });
  }

  async findPending(batchSize: number): Promise<OutboxRow[]> {
    return this.prisma.outbox.findMany({
      where: {
        status: OutBoxStatus.PENDING,
      },
      take: batchSize,
    });
  }

  async markPublished(id: string): Promise<void> {
    await this.prisma.outbox.update({
      where: { id },
      data: {
        status: OutBoxStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, reason: string): Promise<void> {
    await this.prisma.outbox.update({
      where: { id },
      data: {
        status: OutBoxStatus.FAILED,
        lastError: reason,
      },
    });
  }

  async incrementRetry(
    id: string,
    nextRetryAt: Date,
    reason: string,
  ): Promise<void> {
    await this.prisma.outbox.update({
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
