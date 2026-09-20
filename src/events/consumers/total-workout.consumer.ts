import { getChannel } from "../../lib/rabbitmq";
import { RABBITMQ_QUEUE_NAMES } from "../../lib/constants";
import { syncTotalWorkoutCountService } from "../../routes/totalWorkout/total-workout.service";
import { parseWorkoutSyncMessage } from "../parse-workout-sync-message";

export function startTotalWorkoutsConsumer() {
  const channel = getChannel();

  channel.consume(RABBITMQ_QUEUE_NAMES.TOTAL_WORKOUTS_SYNC, async (message) => {
    if (!message) return;

    try {
      const parsed = JSON.parse(message.content.toString()) as unknown;
      const payload = parseWorkoutSyncMessage(parsed);

      if (!payload) {
        console.error("Total workouts consumer dropped invalid message:", parsed);
        channel.nack(message, false, false);
        return;
      }

      await syncTotalWorkoutCountService(payload.userId, payload.workoutType);

      if (
        payload.previousWorkoutType &&
        payload.previousWorkoutType !== payload.workoutType
      ) {
        await syncTotalWorkoutCountService(
          payload.userId,
          payload.previousWorkoutType,
        );
      }

      channel.sendToQueue(
        RABBITMQ_QUEUE_NAMES.BADGE_EVALUATION,
        Buffer.from(JSON.stringify({ userId: payload.userId })),
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
}
