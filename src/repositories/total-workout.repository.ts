import { WorkoutType } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const totalWorkoutRepository = {
  findManyByUserId(userId: string) {
    return prisma.totalWorkouts.findMany({
      where: { userId },
      orderBy: { workoutType: "asc" },
    });
  },

  findByUserAndType(userId: string, workoutType: WorkoutType) {
    return prisma.totalWorkouts.findUnique({
      where: { userId_workoutType: { userId, workoutType } },
    });
  },

  findFirstByIdAndUserId(id: number, userId: string) {
    return prisma.totalWorkouts.findFirst({ where: { id, userId } });
  },

  findMany() {
    return prisma.totalWorkouts.findMany({ orderBy: { id: "desc" } });
  },

  create(userId: string, workoutType: WorkoutType, totalCount: number) {
    return prisma.totalWorkouts.create({
      data: { userId, workoutType, totalCount },
    });
  },

  update(
    id: number,
    data: { workoutType?: WorkoutType; totalCount?: number },
  ) {
    return prisma.totalWorkouts.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.totalWorkouts.delete({ where: { id } });
  },
};
