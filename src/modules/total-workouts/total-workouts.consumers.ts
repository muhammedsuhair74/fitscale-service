import { getChannel } from "../../lib/rabbitmq";
import { RABBITMQ_QUEUE_NAMES, WorkoutEventPayload } from "../../constants";
import { syncTotalWorkoutCountService } from "./total-workouts.service";

async function handleWorkoutEvent(payload: WorkoutEventPayload) {
  await syncTotalWorkoutCountService(payload.userId, payload.workoutType);

  if (
    payload.event === "updated" &&
    payload.previousWorkoutType &&
    payload.previousWorkoutType !== payload.workoutType
  ) {
    await syncTotalWorkoutCountService(
      payload.userId,
      payload.previousWorkoutType,
    );
  }
}

export function startTotalWorkoutsConsumer() {
  const channel = getChannel();

  channel.consume(
    RABBITMQ_QUEUE_NAMES.TOTAL_WORKOUTS_SYNC,
    async (message) => {
      if (!message) return;

      try {
        const payload = JSON.parse(
          message.content.toString(),
        ) as WorkoutEventPayload;

        console.log("Total workouts consumer:", payload.event, payload);
        await handleWorkoutEvent(payload);
        channel.ack(message);
      } catch (error) {
        console.error("Total workouts consumer error:", error);
        channel.nack(message, false, true);
      }
    },
  );

  console.log("Total workouts consumer started");
}

export { handleWorkoutEvent };
