import {
  EventSourceTypes,
  OutBoxStatus,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import { DomainEvent } from "../outbox.types";

type OutboxRow = Prisma.OutboxGetPayload<Record<string, never>>;

interface IOutboxRepository {
  save(
    tx: Prisma.TransactionClient,
    event: DomainEvent<unknown>,
  ): Promise<void>;

  findPending(batchSize: number): Promise<OutboxRow[]>;

  markPublished(id: string): Promise<void>;

  markFailed(id: string, reason: string): Promise<void>;

  incrementRetry(id: string, nextRetryAt: Date, reason: string): Promise<void>;
}

export class OutboxRepository implements IOutboxRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(
    tx: Prisma.TransactionClient,
    event: DomainEvent<unknown>,
  ): Promise<void> {
    const created = await tx.outbox.create({
      data: {
        eventId: event.eventId,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        aggregateVersion: event.aggregateVersion,
        correlationId: event.correlationId,
        causationId: event.causationId,
        headers: event.headers as Prisma.InputJsonValue | undefined,
        payload: event.payload as Prisma.InputJsonValue,
        status: OutBoxStatus.PENDING,
        producer: EventSourceTypes.WORKOUT_CREATED,
        routingKey: event.eventType,
        sourceService: EventSourceTypes.WORKOUT_CREATED,
      },
    });

    if (!created) {
      throw new Error("Failed to save event to outbox");
    }
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
