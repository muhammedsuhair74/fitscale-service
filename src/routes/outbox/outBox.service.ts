import { Prisma } from "@prisma/client";
import { DomainEvent } from "../../infrastructure/events/contracts/domain-event";
import { OutboxRepository } from "../../infrastructure/events/outBox/repository/outbox.repository";
import { prisma } from "../../lib/prisma";

const outboxRepositoryInstance = new OutboxRepository(prisma);

export const saveEventRepository = async (
  tx: Prisma.TransactionClient,
  event: DomainEvent<unknown>,
): Promise<boolean> => {
  try {
    await outboxRepositoryInstance.save(tx, event);
    return true;
  } catch (error) {
    throw error;
  }
};
