import { Router } from "express";
import {
  createNotificationController,
  getUnreadNotificationsController,
  markNotificationAsReadController,
} from "../controllers/notification.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { createNotificationSchema } from "../validators/notification.schema";

const notificationRoutes = Router();

notificationRoutes.post(
  "/",
  validateBody(createNotificationSchema),
  createNotificationController,
);
notificationRoutes.get("/unread", getUnreadNotificationsController);
notificationRoutes.patch("/:id/read", markNotificationAsReadController);

export default notificationRoutes;
