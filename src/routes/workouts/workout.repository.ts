import { Prisma, PrismaClient, Workout, WorkoutType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { saveEventRepository } from "../../routes/outbox/outBox.service";
import { DomainEvent } from "../../infrastructure/events/contracts/domain-event";
import { EventType } from "../../infrastructure/events/contracts/event-type";
import { AggregateType } from "../../infrastructure/events/contracts/aggregate-type";
import { OutboxRepository } from "../../infrastructure/events/outBox/repository/outbox.repository";
// import createDomainEvent from "../../infrastructure/events/create-domain-event";

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

  create(userId: string, workoutType: WorkoutType, count: number) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      try {
        const outboxRepositoryInstance = new OutboxRepository(
          tx as PrismaClient,
        );
        const workout = await tx.workout.create({
          data: { userId, workoutType, count },
        });

        // const payload: WorkoutCreatedEventPayload = {
        //   userId,
        //   workoutType,
        //   count,
        // };

        // const eventDetails: DomainEvent<WorkoutCreatedEventPayload> =
        //   createDomainEvent<WorkoutCreatedEventPayload>({
        //     aggregateId: workout.id,
        //     aggregateType: AggregateType.WORKOUT,
        //     causationId: workout.id,
        //     aggregateVersion: 1,
        //     payload,
        //     eventType: EventType.WORKOUT_CREATED,
        //   });

        // await outboxRepositoryInstance.save(tx, eventDetails);

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
