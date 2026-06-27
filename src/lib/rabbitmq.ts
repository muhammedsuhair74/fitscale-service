import amqp from "amqplib";
import { RABBITMQ_EXCHANGE, RABBITMQ_QUEUE_NAMES } from "./constants";
import bindQueuesToExchange from "./rabbitmq.utils";

let channel: amqp.Channel | null = null;

export async function connectRabbit() {
  const connection = await amqp.connect("amqp://guest:guest@localhost:5672");

  channel = await connection.createChannel();

  await channel.assertExchange(RABBITMQ_EXCHANGE, "fanout", { durable: true });

  await channel.assertQueue(RABBITMQ_QUEUE_NAMES.TOTAL_WORKOUTS_SYNC, {
    durable: true,
  });
  await channel.assertQueue(RABBITMQ_QUEUE_NAMES.BADGE_EVALUATION, {
    durable: true,
  });
  await channel.assertQueue(RABBITMQ_QUEUE_NAMES.NOTIFICATIONS, {
    durable: true,
  });

  await bindQueuesToExchange({
    arrayOfQueues: [
      RABBITMQ_QUEUE_NAMES.TOTAL_WORKOUTS_SYNC,
      RABBITMQ_QUEUE_NAMES.BADGE_EVALUATION,
      RABBITMQ_QUEUE_NAMES.NOTIFICATIONS,
    ],
    exchange: RABBITMQ_EXCHANGE,
  });

  console.log("RabbitMQ Connected");
}

export function getChannel() {
  return channel as amqp.Channel;
}
