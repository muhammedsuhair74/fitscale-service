import { z } from "zod";
import { NotificationType } from "@prisma/client";

export const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.nativeEnum(NotificationType, {
    error: "Invalid notification type",
  }),
});
