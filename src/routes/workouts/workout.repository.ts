import { Prisma, Workout, WorkoutType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { saveEventRepository } from "../../routes/outbox/outBox.service";
import { DomainEvent } from "../../infrastructure/events/contracts/domain-event";
import { generateEventPayload } from "../../utils/events";
import { EVENT_TYPES } from "../../infrastructure/events/contracts/event-type";
import { AggregateType } from "../../infrastructure/events/contracts/aggregate-type";

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
    headers?: Object,
  ) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      try {
        const workout = await tx.workout.create({
          data: { userId, workoutType, count },
        });

        const payload: WorkoutCreatedEventPayload = {
          userId,
          workoutType,
          count,
        };

        const eventDetails: DomainEvent<WorkoutCreatedEventPayload> =
          generateEventPayload<WorkoutCreatedEventPayload>({
            aggregateId: workout.id,
            aggregateType: AggregateType.WORKOUT,
            causationId: workout.id,
            aggregateVersion: 1,
            payload,
            headers,
            eventType: EVENT_TYPES.WORKOUT_CREATED,
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
