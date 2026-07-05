import { getChannel } from "../../lib/rabbitmq";
import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_QUEUE_NAMES,
  WorkoutEventPayload,
} from "../../lib/constants";
import { syncTotalWorkoutCountService } from "../../services/total-workout.service";

export function startTotalWorkoutsConsumer() {
  const channel = getChannel();

  channel.consume(RABBITMQ_QUEUE_NAMES.TOTAL_WORKOUTS_SYNC, async (message) => {
    if (!message) return;

    try {
      const payload = JSON.parse(
        message.content.toString(),
      ) as WorkoutEventPayload;

      console.log("Total workouts consumer:", payload.event, payload);
      await syncTotalWorkoutCountService(payload.userId, payload.workoutType);

      channel.sendToQueue(
        RABBITMQ_QUEUE_NAMES.BADGE_EVALUATION,
        Buffer.from(JSON.stringify(payload)),
        {
          persistent: true,
        },
      );

      channel.ack(message);
    } catch (error) {
      console.error("Total workouts consumer error:", error);
      channel.nack(message, false, true);
    }
  });

  console.log("Total workouts consumer started");
}
