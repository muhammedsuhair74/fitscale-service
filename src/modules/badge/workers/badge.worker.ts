import { getChannel } from "../../../lib/rabbitmq";
import { evaluatePushupBadges } from "../badge.controller";

export async function startBadgeWorker() {
  const channel = getChannel();

  channel.consume("workout-created", async (message) => {
    if (!message) return;

    const payload = JSON.parse(message.content.toString());

    await evaluatePushupBadges(payload.userId);

    channel.ack(message);
  });
}
