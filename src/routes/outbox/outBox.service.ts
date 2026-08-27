import { EventSourceTypes, Prisma } from "@prisma/client";
import { DomainEvent } from "../../infrastructure/events/contracts/domain-event";
import { OutboxRepository } from "../../infrastructure/events/outBox/repository/outbox.repository";
import { prisma } from "../../lib/prisma";
import { TransactionContext } from "../../lib/transactionService";

const outboxRepositoryInstance = new OutboxRepository(prisma);

export const saveEventRepository = async ({
  transactionContext,
  event,
  producer,
  sourceService,
}: {
  transactionContext: TransactionContext;
  event: DomainEvent<unknown>;
  producer: EventSourceTypes;
  sourceService: EventSourceTypes;
}): Promise<boolean> => {
  try {
    await outboxRepositoryInstance.save({
      transactionContext,
      event,
      producer,
      sourceService,
    });
    return true;
  } catch (error) {
    throw error;
  }
};
