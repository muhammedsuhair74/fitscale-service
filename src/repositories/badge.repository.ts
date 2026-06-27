import { BadgeType } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const badgeRepository = {
  findManyByUserId(userId: string) {
    return prisma.badge.findMany({
      where: { userId },
      orderBy: { awardedAt: "desc" },
    });
  },

  findFirstByIdAndUserId(id: number, userId: string) {
    return prisma.badge.findFirst({ where: { id, userId } });
  },

  create(userId: string, badgeType: BadgeType) {
    return prisma.badge.create({ data: { userId, badgeType } });
  },

  findUniqueByUserAndType(userId: string, badgeType: BadgeType) {
    return prisma.badge.findUnique({
      where: { userId_badgeType: { userId, badgeType } },
    });
  },

  update(id: number, badgeType: BadgeType) {
    return prisma.badge.update({ where: { id }, data: { badgeType } });
  },

  delete(id: number) {
    return prisma.badge.delete({ where: { id } });
  },
};
