import { getChannel } from "../../../lib/rabbitmq";
import { RABBITMQ_QUEUE_NAMES, WorkoutEventPayload } from "../../../constants";
import { handleBadgeWorkoutEvent } from "../badge.controller";

export function startBadgeWorker() {
  const channel = getChannel();

  channel.consume(RABBITMQ_QUEUE_NAMES.BADGE_EVALUATION, async (message) => {
    if (!message) return;

    try {
      const payload = JSON.parse(
        message.content.toString(),
      ) as WorkoutEventPayload;

      console.log("Badge worker:", payload.event, payload);
      await handleBadgeWorkoutEvent(payload);
      channel.ack(message);
    } catch (error) {
      console.error("Badge worker error:", error);
      channel.nack(message, false, true);
    }
  });

  console.log("Badge worker started");
}
