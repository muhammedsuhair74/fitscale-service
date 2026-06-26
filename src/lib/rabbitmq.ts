import amqp from "amqplib";
import { RABBITMQ_EXCHANGE, RABBITMQ_QUEUE_NAMES } from "../constants";

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

  await channel.bindQueue(
    RABBITMQ_QUEUE_NAMES.TOTAL_WORKOUTS_SYNC,
    RABBITMQ_EXCHANGE,
    "",
  );
  await channel.bindQueue(
    RABBITMQ_QUEUE_NAMES.BADGE_EVALUATION,
    RABBITMQ_EXCHANGE,
    "",
  );

  console.log("RabbitMQ Connected");
}

export function getChannel() {
  return channel as amqp.Channel;
}
