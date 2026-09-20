import { getChannel } from "../../lib/rabbitmq";
import { RABBITMQ_QUEUE_NAMES } from "../../lib/constants";
import { evaluateAllBadges } from "../../routes/badge/badge.service";

export function startBadgeWorker() {
  const channel = getChannel();

  channel.consume(RABBITMQ_QUEUE_NAMES.BADGE_EVALUATION, async (message) => {
    if (!message) return;

    try {
      const parsed = JSON.parse(message.content.toString()) as {
        userId?: string;
        payload?: { userId?: string };
      };
      const userId = parsed.userId ?? parsed.payload?.userId;

      if (!userId) {
        console.error("Badge worker dropped invalid message:", parsed);
        channel.nack(message, false, false);
        return;
      }

      await evaluateAllBadges(userId);
      channel.sendToQueue(
        RABBITMQ_QUEUE_NAMES.NOTIFICATIONS,
        Buffer.from(JSON.stringify({ userId })),
        { persistent: true },
      );
      channel.ack(message);
    } catch (error) {
      console.error("Badge worker error:", error);
      channel.nack(message, false, true);
    }
  });
}
