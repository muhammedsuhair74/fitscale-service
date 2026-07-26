import { WorkoutType } from "@prisma/client";
import { getChannel } from "../../lib/rabbitmq";
import {
  eventPayload,
  RABBITMQ_QUEUE_NAMES,
  WorkoutEventType,
} from "../../lib/constants";
import { DomainEvent } from "../../infrastructure/events/contracts/domain-event";

function enqueueWorkoutSync(payload: eventPayload<unknown>) {
  const channel = getChannel();
  channel.sendToQueue(
    RABBITMQ_QUEUE_NAMES.TOTAL_WORKOUTS_SYNC,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true },
  );
}

export async function publishWorkoutCreated<T>({
  eventType,
  payload,
}: DomainEvent<T>) {
  console.log("publishWorkoutCreated", payload);
  console.log("eventType", eventType);
}

export function publishWorkoutUpdated(
  workoutId: string,
  userId: string,
  workoutType: WorkoutType,
  previousWorkoutType: WorkoutType,
) {
  enqueueWorkoutSync({
    event: WorkoutEventType.UPDATED,
    payload: {
      workoutId,
      userId,
      workoutType,
      previousWorkoutType,
    },
  });
}

export function publishWorkoutDeleted(
  workoutId: string,
  userId: string,
  workoutType: WorkoutType,
) {
  enqueueWorkoutSync({
    event: WorkoutEventType.DELETED,
    payload: {
      workoutId,
      userId,
      workoutType,
    },
  });
}

export type { DomainEvent };
