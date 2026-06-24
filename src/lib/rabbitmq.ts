import amqp from "amqplib";
import { RABBITMQ_QUEUE_NAMES } from "../constants";

let channel: amqp.Channel | null = null;

export async function connectRabbit() {
  const connection = await amqp.connect("amqp://guest:guest@localhost:5672");

  channel = await connection.createChannel();

  await channel.assertQueue(RABBITMQ_QUEUE_NAMES.WORKOUT_CREATED);

  console.log("RabbitMQ Connected");
}

export function getChannel() {
  return channel as amqp.Channel;
}
