import { getChannel } from "../../lib/rabbitmq";
import { RABBITMQ_QUEUE_NAMES } from "../../lib/constants";
import { evaluateAllBadges } from "../../routes/badge/badge.service";

export function startBadgeWorker() {
  const channel = getChannel();

  channel.consume(RABBITMQ_QUEUE_NAMES.BADGE_EVALUATION, async (message) => {
    if (!message) return;

    try {
      const payload = JSON.parse(message.content.toString());

      await evaluateAllBadges(payload.userId);
      channel.sendToQueue(
        RABBITMQ_QUEUE_NAMES.NOTIFICATIONS,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true },
      );
      channel.ack(message);
    } catch (error) {
      console.error("Badge worker error:", error);
      channel.nack(message, false, true);
    }
  });
}
