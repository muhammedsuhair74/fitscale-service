import { EventFactory } from "../infrastructure/events";
import SystemClock from "../infrastructure/events/eventCollaborators/clocks/SystemClock";
import UUIDGenerator from "../infrastructure/events/eventCollaborators/idGenerator/UUIDGenerator";
import { EventStore } from "../infrastructure/events/eventStores/eventStore";
import { OutboxRepository } from "../infrastructure/events/outBox/repository/outbox.repository";
import { TransactionContext } from "../lib/transactionService";

export const createEventFactory = new EventFactory({
  idGenerator: new UUIDGenerator(),
  clock: new SystemClock(),
});

export const createEventStore = (transactionContext: TransactionContext) =>
  new OutboxRepository(transactionContext);
