import { WorkoutType } from "@prisma/client";
import { getChannel } from "../../lib/rabbitmq";
import {
  RABBITMQ_QUEUE_NAMES,
  WorkoutEventPayload,
  WorkoutEventType,
} from "../../lib/constants";

function enqueueWorkoutSync(payload: WorkoutEventPayload) {
  const channel = getChannel();
  channel.sendToQueue(
    RABBITMQ_QUEUE_NAMES.TOTAL_WORKOUTS_SYNC,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true },
  );
}

export function publishWorkoutCreated(
  workoutId: string,
  userId: string,
  workoutType: WorkoutType,
) {
  enqueueWorkoutSync({
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
  enqueueWorkoutSync({
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
  enqueueWorkoutSync({
    event: "deleted",
    workoutId,
    userId,
    workoutType,
  });
}

export type { WorkoutEventPayload, WorkoutEventType };
