import { emitNotification } from "../../socket/socketEmitter";
import { getChannel } from "../../lib/rabbitmq";
import { RABBITMQ_QUEUE_NAMES } from "../../lib/constants";

interface NotificationEventPayload {
  userId: string;
  title: string;
  message: string;
  type: string;
}

export function startNotificationConsumer() {
  const channel = getChannel();

  channel.consume(RABBITMQ_QUEUE_NAMES.NOTIFICATIONS, async (message) => {
    if (!message) return;

    try {
      const payload = JSON.parse(
        message.content.toString(),
      ) as NotificationEventPayload;

      emitNotification(payload.userId, {
        title: payload.title,
        message: payload.message,
        type: payload.type,
      });
      channel.ack(message);
    } catch (error) {
      console.error("Notification consumer error:", error);
      channel.nack(message, false, true);
    }
  });
}
