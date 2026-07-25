import {
  OutBoxStatus,
  Prisma,
  PrismaClient,
  outbox as OutBox,
} from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/client";
import { DomainEvent } from "../outbox.types";
// import { OutBox } from "../../domain/outBox/outbox.entity";
// import { DomainEvent } from "../../domain/event/domain.event";

interface IOutboxRepository {
  save(
    tx: Prisma.TransactionClient,
    event: DomainEvent<unknown>,
  ): Promise<void>;

  findPending(batchSize: number): Promise<OutBox[]>;

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
    const outboxData = {
      eventId: event.eventId,
      eventType: event.eventType,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      aggregateVersion: event.aggregateVersion,
      correlationId: event.correlationId,
      causationId: event.causationId,
      payload: event.payload as Prisma.InputJsonValue,
      status: OutBoxStatus.PENDING,
    };

    const created = await tx.outbox.create({
      data: outboxData,
    });
    return;
    // return created;
  }

  async findPending(batchSize: number): Promise<OutBox[]> {
    const outboxes = await this.prisma.outbox.findMany({
      where: {
        status: OutBoxStatus.PENDING,
      },
      take: batchSize,
    });

    return outboxes;
  }

  async markPublished(id: string): Promise<void> {
    await this.prisma.outbox.update({
      where: { id },
      data: { status: OutBoxStatus.DONE },
    });
  }

  async markFailed(id: string, reason: string): Promise<void> {
    await this.prisma.outbox.update({
      where: { id },
      data: { status: OutBoxStatus.INPROGRESS, error: reason },
    });
  }

  async incrementRetry(
    id: string,
    nextRetryAt: Date,
    reason: string,
  ): Promise<void> {
    await this.prisma.outbox.update({
      where: { id },
      data: { status: OutBoxStatus.INPROGRESS, error: reason },
    });
  }
}

// export const saveEventRepository = async (
//   tx: Prisma.TransactionClient,
//   event: DomainEvent<unknown>,
// ) => {
//   try {
//     const outboxData = {
//       eventId: event.eventId,
//       eventType: event.eventType,
//       aggregateId: event.aggregateId,
//       aggregateType: event.aggregateType,
//       aggregateVersion: event.aggregateVersion,
//       correlationId: event.correlationId,
//       causationId: event.causationId,
//       payload: event.payload as Prisma.InputJsonValue,
//       status: OutBoxStatus.PENDING,
//     };

//     const created = await tx.outbox.create({
//       data: outboxData,
//     });

//     return created;
//   } catch (error) {
//     throw error;
//   }
// };
