import { EventSourceTypes, Prisma } from "@prisma/client";
import { DomainEvent } from "../contracts/domain-event";
import { TransactionContext } from "../../../lib/transactionService";

// type OutboxRow = Prisma.OutboxGetPayload<Record<string, never>>;

export interface EventStore {
  save({
    transactionContext,
    event,
    producer,
    sourceService,
  }: {
    transactionContext: TransactionContext;
    event: DomainEvent<unknown>;
    producer: EventSourceTypes;
    sourceService: EventSourceTypes;
  }): Promise<void>;

  // findPending(batchSize: number): Promise<OutboxRow[]>;

  // markPublished(id: string): Promise<void>;

  // markFailed(id: string, reason: string): Promise<void>;

  // incrementRetry(id: string, nextRetryAt: Date, reason: string): Promise<void>;
}
