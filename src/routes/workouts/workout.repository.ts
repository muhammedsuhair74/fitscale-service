import { Prisma, PrismaClient, Workout, WorkoutType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { saveEventRepository } from "../../routes/outbox/outBox.service";
import { EventType } from "../../infrastructure/events/contracts/event-type";
import { AggregateType } from "../../infrastructure/events/contracts/aggregate-type";
import { EventFactory } from "../../infrastructure/events";

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

  create(
    userId: string,
    workoutType: WorkoutType,
    count: number,
    eventFactory: EventFactory,
  ) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      try {
        const workout = await tx.workout.create({
          data: { userId, workoutType, count },
        });

        const event = eventFactory.create<WorkoutCreatedEventPayload>({
          correlationId: workout.id,
          causationId: workout.id,
          aggregateType: AggregateType.WORKOUT,
          aggregateId: workout.id,
          aggregateVersion: 1,
          payload: { userId, workoutType, count },
          eventType: EventType.WORKOUT_CREATED,
        });
        const result = await saveEventRepository(tx, event);
        if (!result) {
          await tx.$executeRawUnsafe("ROLLBACK");
          throw new Error("Failed to save event");
        }
        await tx.$executeRawUnsafe("COMMIT");
        return workout;
      } catch (error) {
        await tx.$executeRawUnsafe("ROLLBACK");
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
