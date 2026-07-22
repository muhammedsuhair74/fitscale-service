import { WorkoutType } from "@prisma/client";
import { getChannel } from "../../lib/rabbitmq";
import {
  RABBITMQ_QUEUE_NAMES,
  WorkoutEventType,
  WorkoutEventPayload,
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
  // const outboxBody: Outbox = {
  //   event: WorkoutEventType.CREATED,
  //   payload: {
  //     workoutId,
  //     userId,
  //     workoutType,
  //   },
  // };
  // createOutBoxService(outboxBody);
  // enqueueWorkoutSync({
  //   event: WorkoutEventType.CREATED,
  //   workoutId,
  //   userId,
  //   workoutType,
  // });
}

export function publishWorkoutUpdated(
  workoutId: string,
  userId: string,
  workoutType: WorkoutType,
  previousWorkoutType: WorkoutType,
) {
  enqueueWorkoutSync({
    event: WorkoutEventType.UPDATED,
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
    event: WorkoutEventType.DELETED,
    workoutId,
    userId,
    workoutType,
  });
}

export type { WorkoutEventPayload, WorkoutEventType };
