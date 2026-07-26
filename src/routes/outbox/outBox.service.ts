import { Prisma } from "@prisma/client";
import { DomainEvent } from "../../infrastructure/events/contracts/domain-event";
import { OutboxRepository } from "../../infrastructure/events/outBox/repository/outbox.repository";
import { prisma } from "../../lib/prisma";

const outboxRepositoryInstance = new OutboxRepository(prisma);

export const saveEventRepository = async (
  tx: Prisma.TransactionClient,
  event: DomainEvent<unknown>,
) => {
  try {
    const result = await outboxRepositoryInstance.save(tx, event);

    return { success: true, data: event };
  } catch (error) {
    throw error;
  }
};

// export const createEventService = async (event: any) => {
//   const events = await Event.findAll();
//   return events;
// };
