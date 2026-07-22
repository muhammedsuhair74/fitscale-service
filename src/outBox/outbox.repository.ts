import { OutBoxStatus, Prisma } from "@prisma/client";
import { DomainEvent } from "./outbox.types";

export const createEventRepository = async (
  tx: Prisma.TransactionClient,
  event: DomainEvent<unknown>,
) => {
  try {
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

    return created;
  } catch (error) {
    throw error;
  }
};
