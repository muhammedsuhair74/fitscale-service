import { Workout, WorkoutType } from "@prisma/client";
import { prisma } from "../lib/prisma";

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
    return prisma.workout.create({ data });
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
