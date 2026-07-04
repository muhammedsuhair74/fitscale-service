import { NotificationType } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const notificationRepository = {
  createNotificationRepository(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
  }) {
    return prisma.notification.create({ data });
  },

  findNotificationsRepository(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  markAsReadRepository(id: number) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },

  findUnreadByUserIdRepository(userId: string) {
    return prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: "desc" },
    });
  },
};
