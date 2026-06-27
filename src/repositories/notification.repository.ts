import { NotificationType } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const notificationRepository = {
  create(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
  }) {
    return prisma.notification.create({ data });
  },

  markAsRead(id: number) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },

  findUnreadByUserId(userId: string) {
    return prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: "desc" },
    });
  },
};
