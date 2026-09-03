import { Prisma, PrismaClient, Workout, WorkoutType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { TransactionContext } from "../../lib/transactionService";

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
    transactionContext: TransactionContext,
  ) {
    return transactionContext.workout.create({
      data: { userId, workoutType, count },
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
