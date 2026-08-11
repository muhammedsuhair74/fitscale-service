import { Workout } from "@prisma/client";
import { EventType } from "../contracts/event-type";
import { publishWorkoutCreated } from "../../../events/publishers/workout.publisher";
import { randomUUID } from "crypto";
import { uuidv4 } from "zod/v4/classic/external.cjs";
import { WorkoutEventType } from "../../../lib/constants";

export const publishWorkoutCreatedEvent = async (workout: Workout) => {
  // const event = {
  //   eventType: EventType.WORKOUT_CREATED,
  //   eventId: randomUUID(),
  //   correlationId: uuidv4(),
  //   causationId: uuidv4(),
  //   occurredAt: new Date(),
  //   aggregateId: workout.id,
  //   aggregateType: "workout",
  //   aggregateVersion: 1,
  //   payload: workout,
  // };
  // try {
  //   await publishWorkoutCreated({
  //     eventType: WorkoutEventType.CREATED,
  //     payload: workout,
  //   });
  // } catch (error) {
  //   console.error("Error publishing workout created event:", error);
  //   throw error;
  // }
};

// const publishWorkoutCreated = async (workout: Workout) => {
//     const event = {
//         type: "WORKOUT_CREATED",
//         data: {
//             id: workout.id,
//             userId: workout.userId,
//             workoutType: workout.workoutType,
//             count: workout.count,
//         },
//     };
// }
