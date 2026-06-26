import { prisma } from "../../lib/prisma";
import { Badge, BadgeType, WorkoutType } from "@prisma/client";

const BADGE_THRESHOLDS: Record<
  WorkoutType,
  { bronze: number; silver: number; gold: number }
> = {
  PUSHUP: { bronze: 100, silver: 500, gold: 1000 },
  SQUAT: { bronze: 100, silver: 500, gold: 1000 },
  SITUP: { bronze: 100, silver: 500, gold: 1000 },
  PLANK: { bronze: 100, silver: 500, gold: 1000 },
};

const BADGE_TYPES: Record<
  WorkoutType,
  { bronze: BadgeType; silver: BadgeType; gold: BadgeType }
> = {
  PUSHUP: {
    bronze: "BRONZE_PUSHUP",
    silver: "SILVER_PUSHUP",
    gold: "GOLD_PUSHUP",
  },
  SQUAT: {
    bronze: "BRONZE_SQUAT",
    silver: "SILVER_SQUAT",
    gold: "GOLD_SQUAT",
  },
  SITUP: {
    bronze: "BRONZE_SITUP",
    silver: "SILVER_SITUP",
    gold: "GOLD_SITUP",
  },
  PLANK: {
    bronze: "BRONZE_PLANK",
    silver: "SILVER_PLANK",
    gold: "GOLD_PLANK",
  },
};

export const getBadgesByUserService = async (userId: string) => {
  return prisma.badge.findMany({
    where: { userId },
    orderBy: { awardedAt: "desc" },
  });
};

export const getBadgeByIdService = async (userId: string, id: number) => {
  const badge = await prisma.badge.findFirst({
    where: { id, userId },
  });

  if (!badge) {
    throw new Error("Badge not found");
  }

  return badge;
};

export const awardBadgeService = async (
  badgeType: BadgeType,
  userId: string,
) => {
  try {
    return await prisma.badge.create({
      data: { userId, badgeType },
    });
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return prisma.badge.findUnique({
        where: { userId_badgeType: { userId, badgeType } },
      });
    }
    throw new Error("Failed to create badge");
  }
};

export const updateBadgeService = async (
  userId: string,
  id: number,
  badgeType: BadgeType,
) => {
  const existing = await getBadgeByIdService(userId, id);

  return prisma.badge.update({
    where: { id: existing.id },
    data: { badgeType },
  });
};

export const deleteBadgeService = async (userId: string, id: number) => {
  await getBadgeByIdService(userId, id);
  await prisma.badge.delete({ where: { id } });
};

async function getTotalForWorkoutType(
  userId: string,
  workoutType: WorkoutType,
) {
  const totalWorkout = await prisma.totalWorkouts.findUnique({
    where: {
      userId_workoutType: { userId, workoutType },
    },
  });

  if (totalWorkout) {
    return totalWorkout.totalCount;
  }

  const result = await prisma.workout.aggregate({
    where: { userId, workoutType },
    _sum: { count: true },
  });

  return result._sum.count ?? 0;
}

export async function evaluateBadgesForWorkoutType(
  userId: string,
  workoutType: WorkoutType,
) {
  const total = await getTotalForWorkoutType(userId, workoutType);
  const thresholds = BADGE_THRESHOLDS[workoutType];
  const badgeTypes = BADGE_TYPES[workoutType];

  if (total >= thresholds.bronze) {
    await awardBadgeService(badgeTypes.bronze, userId);
  }
  if (total >= thresholds.silver) {
    await awardBadgeService(badgeTypes.silver, userId);
  }
  if (total >= thresholds.gold) {
    await awardBadgeService(badgeTypes.gold, userId);
  }
}

export async function evaluateAllBadges(userId: string) {
  const workoutTypes: WorkoutType[] = ["PUSHUP", "SQUAT", "SITUP", "PLANK"];

  for (const workoutType of workoutTypes) {
    await evaluateBadgesForWorkoutType(userId, workoutType);
  }
}

export default {
  getBadgesByUserService,
  getBadgeByIdService,
  awardBadgeService,
  updateBadgeService,
  deleteBadgeService,
  evaluateBadgesForWorkoutType,
  evaluateAllBadges,
};
