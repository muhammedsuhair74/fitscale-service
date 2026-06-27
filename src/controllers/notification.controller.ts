import { Request, Response } from "express";
import {
  createNotificationService,
  getUnreadNotificationsService,
  markNotificationAsReadService,
} from "../services/notification.service";

type AuthUser = { userId: string };

export const createNotificationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const { title, message, type } = req.body;
    const notification = await createNotificationService(
      userId,
      title,
      message,
      type,
    );
    res.status(201).json({
      notification,
      success: true,
      message: "Notification created successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const markNotificationAsReadController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const notification = await markNotificationAsReadService(
      userId,
      Number(req.params.id),
    );
    res.status(200).json({
      notification,
      success: true,
      message: "Notification marked as read successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const getUnreadNotificationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const notifications = await getUnreadNotificationsService(userId);
    res.status(200).json({
      notifications,
      success: true,
      message: "Unread notifications fetched successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};
