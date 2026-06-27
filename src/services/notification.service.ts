import { NotificationType } from "@prisma/client";
import { notificationRepository } from "../repositories/notification.repository";

export const createNotificationService = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
) => {
  return notificationRepository.create({ userId, title, message, type });
};

export const markNotificationAsReadService = async (
  userId: string,
  id: number,
) => {
  const notification = await notificationRepository.markAsRead(id);
  if (notification.userId !== userId) {
    throw new Error("Notification not found");
  }
  return notification;
};

export const getUnreadNotificationsService = async (userId: string) => {
  return notificationRepository.findUnreadByUserId(userId);
};
