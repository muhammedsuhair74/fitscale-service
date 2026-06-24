import { getChannel } from "../../lib/rabbitmq";
import { RABBITMQ_QUEUE_NAMES } from "../../constants";

export async function publishWorkoutCreated(workoutId: string, userId: string) {
  const channel = getChannel();

  channel.sendToQueue(
    RABBITMQ_QUEUE_NAMES.WORKOUT_CREATED,
    Buffer.from(
      JSON.stringify({
        workoutId,
        userId,
      }),
    ),
  );
}
