import { Router } from "express";
import {
  createNotificationController,
  getUnreadNotificationsController,
  markNotificationAsReadController,
} from "../controllers/notification.controller";

const notificationRoutes = Router();

notificationRoutes.post("/", createNotificationController);
notificationRoutes.get("/unread", getUnreadNotificationsController);
notificationRoutes.patch("/:id/read", markNotificationAsReadController);

export default notificationRoutes;
