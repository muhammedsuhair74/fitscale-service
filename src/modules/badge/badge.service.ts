import { prisma } from "../../lib/prisma";
import { Badge, BadgeType } from "@prisma/client";

const getBadgesService = async () => {
  const badges = await prisma.badge.findMany();
  return badges;
};

const getBadgeByIdService = async (id: string) => {
  const badge = await prisma.badge.findUnique({
    where: { id: Number(id) },
  });
  return badge;
};

const awardBadgeService = async (badgeType: BadgeType, userId: string) => {
  try {
    const newBadge = await prisma.badge.create({
      data: {
        userId,
        badgeType,
      },
    });
    return newBadge;
  } catch (error) {
    throw new Error("Failed to create badge");
  }
};

const updateBadgeService = async (id: number, badge: Badge) => {
  const updatedBadge = await prisma.badge.update({
    where: { id: id },
    data: badge,
  });
  return updatedBadge;
};

const deleteBadgeService = async (id: number) => {
  await prisma.badge.delete({
    where: { id: id },
  });
};

async function getTotalPushupsService(userId: string) {
  const result = await prisma.workout.aggregate({
    where: {
      userId,
      workoutType: "PUSHUP",
    },
    _sum: {
      count: true,
    },
  });

  return result._sum.count ?? 0;
}

async function getTotalSquatsService(userId: string) {
  const result = await prisma.workout.aggregate({
    where: {
      userId,
      workoutType: "SQUAT",
    },
    _sum: {
      count: true,
    },
  });
  return result._sum.count ?? 0;
}

async function getTotalSitupsService(userId: string) {
  const result = await prisma.workout.aggregate({
    where: {
      userId,
      workoutType: "SITUP",
    },
    _sum: {
      count: true,
    },
  });
  return result._sum.count ?? 0;
}

async function getTotalPlanksService(userId: string) {
  const result = await prisma.workout.aggregate({
    where: {
      userId,
      workoutType: "PLANK",
    },
    _sum: {
      count: true,
    },
  });
  return result._sum.count ?? 0;
}

export default {
  getBadgesService,
  getBadgeByIdService,
  awardBadgeService,
  updateBadgeService,
  deleteBadgeService,
  getTotalPushupsService,
  getTotalSquatsService,
  getTotalSitupsService,
  getTotalPlanksService,
};
