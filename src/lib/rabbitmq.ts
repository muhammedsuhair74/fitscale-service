import amqp from "amqplib";
import {
  RABBITMQ_EXCHANGES,
  BADGE_RETRY_QUEUE_NAMES,
  WORKOUT_CREATED_QUEUE_NAMES,
  EVENT_ROUTING_KEYS,
} from "./constants";

let channel: amqp.Channel | null = null;

export async function connectRabbit() {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672",
  );

  channel = await connection.createChannel();

  // Business domain events
  await channel.assertExchange(RABBITMQ_EXCHANGES.DOMAIN_EVENTS, "topic", {
    durable: true,
  });

  await channel.assertExchange(RABBITMQ_EXCHANGES.RETRY_RETURN, "direct", {
    durable: true,
  });

  for (const queueName of Object.values(WORKOUT_CREATED_QUEUE_NAMES)) {
    await channel.assertQueue(queueName, {
      durable: true,
    });
  }

  await channel.bindQueue(
    WORKOUT_CREATED_QUEUE_NAMES.TOTAL_WORKOUTS_SYNC,
    RABBITMQ_EXCHANGES.DOMAIN_EVENTS,
    "workout.*",
  );
  await channel.bindQueue(
    WORKOUT_CREATED_QUEUE_NAMES.NOTIFICATIONS,
    RABBITMQ_EXCHANGES.DOMAIN_EVENTS,
    EVENT_ROUTING_KEYS.WORKOUT_CREATED,
  );
  await channel.bindQueue(
    WORKOUT_CREATED_QUEUE_NAMES.BADGE_EVALUATION,
    RABBITMQ_EXCHANGES.DOMAIN_EVENTS,
    EVENT_ROUTING_KEYS.TOTAL_WORKOUT_UPDATED,
  );
  await channel.bindQueue(
    WORKOUT_CREATED_QUEUE_NAMES.NOTIFICATIONS,
    RABBITMQ_EXCHANGES.DOMAIN_EVENTS,
    EVENT_ROUTING_KEYS.BADGE_AWARDED,
  );

  for (const { QUEUE_NAME, TTL } of Object.values(BADGE_RETRY_QUEUE_NAMES)) {
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      messageTtl: TTL,
      deadLetterExchange: RABBITMQ_EXCHANGES.RETRY_RETURN,
      deadLetterRoutingKey: "badge",
    });
  }
  await channel.bindQueue(
    WORKOUT_CREATED_QUEUE_NAMES.BADGE_EVALUATION,
    RABBITMQ_EXCHANGES.RETRY_RETURN,
    "badge",
  );

  console.log("RabbitMQ Connected");
}

export function getChannel() {
  return channel as amqp.Channel;
}
