import { Prisma, Workout, WorkoutType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { saveEventRepository } from "../../outBox/outBox.service";
import { DomainEvent } from "../../outBox/outbox.types";
import { EventTypes, generateEventPayload } from "../../utils/events";
import { uuidv4 } from "zod";

export type WorkoutCreatedEventPayload = {
  userId: string;
  workoutType: WorkoutType;
  count: number;
};

export const workoutRepository = {
  findManyByUserId(userId: string) {
    return prisma.workout.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  findFirstByIdAndUserId(id: string, userId: string) {
    return prisma.workout.findFirst({ where: { id, userId } });
  },

  findMany() {
    return prisma.workout.findMany();
  },

  create(data: { userId: string; workoutType: WorkoutType; count: number }) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      try {
        const workout = await tx.workout.create({ data });

        const eventDetails: DomainEvent<WorkoutCreatedEventPayload> =
          generateEventPayload({
            aggregateId: workout.id,
            aggregateType: "workout",
            aggregateVersion: 1,
            payload: data,
            eventType: EventTypes.WORKOUT_CREATED,
          });

        await saveEventRepository(tx, eventDetails);

        return workout;
      } catch (error) {
        throw error;
      }
    });
  },

  update(id: string, data: { workoutType: WorkoutType; count: number }) {
    return prisma.workout.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.workout.delete({ where: { id } });
  },

  aggregateCount(userId: string, workoutType: WorkoutType) {
    return prisma.workout.aggregate({
      where: { userId, workoutType },
      _sum: { count: true },
    });
  },
};

export type { Workout };
