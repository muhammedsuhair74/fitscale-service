import { z } from "zod";
import { UserRoles } from "@prisma/client";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(UserRoles).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  role: z.nativeEnum(UserRoles).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid("Invalid user id"),
});

export const userEmailSchema = z.object({
  email: z.string().email("Invalid email"),
});
