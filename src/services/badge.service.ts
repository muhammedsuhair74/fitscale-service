import { BadgeType, WorkoutType } from "@prisma/client";
import { badgeRepository } from "../repositories/badge.repository";
import { totalWorkoutRepository } from "../repositories/total-workout.repository";
import { workoutRepository } from "../repositories/workout.repository";
import { WorkoutEventPayload } from "../lib/constants";

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
  return badgeRepository.findManyByUserId(userId);
};

export const getBadgeByIdService = async (userId: string, id: number) => {
  const badge = await badgeRepository.findFirstByIdAndUserId(id, userId);
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
    return await badgeRepository.create(userId, badgeType);
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return badgeRepository.findUniqueByUserAndType(userId, badgeType);
    }
    throw new Error("Failed to create badge");
  }
};

export const updateBadgeService = async (
  userId: string,
  id: number,
  badgeType: BadgeType,
) => {
  await getBadgeByIdService(userId, id);
  return badgeRepository.update(id, badgeType);
};

export const deleteBadgeService = async (userId: string, id: number) => {
  await getBadgeByIdService(userId, id);
  await badgeRepository.delete(id);
};

async function getTotalForWorkoutType(
  userId: string,
  workoutType: WorkoutType,
) {
  const totalWorkout = await totalWorkoutRepository.findByUserAndType(
    userId,
    workoutType,
  );
  if (totalWorkout) {
    return totalWorkout.totalCount;
  }

  const result = await workoutRepository.aggregateCount(userId, workoutType);
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

export async function handleBadgeWorkoutEvent(payload: WorkoutEventPayload) {
  const typesToEvaluate = new Set<WorkoutType>([payload.workoutType]);

  if (
    payload.event === "updated" &&
    payload.previousWorkoutType &&
    payload.previousWorkoutType !== payload.workoutType
  ) {
    typesToEvaluate.add(payload.previousWorkoutType);
  }

  for (const workoutType of typesToEvaluate) {
    await evaluateBadgesForWorkoutType(payload.userId, workoutType);
  }
}
