import { WorkoutType } from "@prisma/client";
import { getChannel } from "../lib/rabbitmq";
import {
  RABBITMQ_EXCHANGE,
  WorkoutEventPayload,
  WorkoutEventType,
} from "../lib/constants";

function publishWorkoutEvent(payload: WorkoutEventPayload) {
  const channel = getChannel();
  console.log("Publishing workout event", payload);
  channel.publish(RABBITMQ_EXCHANGE, "", Buffer.from(JSON.stringify(payload)), {
    persistent: true,
  });
}

export function publishWorkoutCreated(
  workoutId: string,
  userId: string,
  workoutType: WorkoutType,
) {
  publishWorkoutEvent({
    event: "created",
    workoutId,
    userId,
    workoutType,
  });
}

export function publishWorkoutUpdated(
  workoutId: string,
  userId: string,
  workoutType: WorkoutType,
  previousWorkoutType: WorkoutType,
) {
  publishWorkoutEvent({
    event: "updated",
    workoutId,
    userId,
    workoutType,
    previousWorkoutType,
  });
}

export function publishWorkoutDeleted(
  workoutId: string,
  userId: string,
  workoutType: WorkoutType,
) {
  publishWorkoutEvent({
    event: "deleted",
    workoutId,
    userId,
    workoutType,
  });
}

export type { WorkoutEventPayload, WorkoutEventType };
