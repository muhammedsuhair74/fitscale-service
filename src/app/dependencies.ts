import { EventFactory } from "../infrastructure/events";
import SystemClock from "../infrastructure/events/eventCollaborators/clocks/SystemClock";
import UUIDGenerator from "../infrastructure/events/eventCollaborators/idGenerator/UUIDGenerator";
import { OutboxRepository } from "../infrastructure/events/outBox/repository/outbox.repository";
import { TransactionContext } from "../lib/transactionService";
import { workoutRepository } from "../routes/workouts/workout.repository";
import { createWorkoutService } from "../routes/workouts/workout.service";

export const createEventFactory = new EventFactory({
  idGenerator: new UUIDGenerator(),
  clock: new SystemClock(),
});

export const createEventStore = () => new OutboxRepository();
