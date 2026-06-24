import { z } from "zod";
import { WorkoutType } from "@prisma/client";

export const createTotalWorkoutSchema = z.object({
  workoutType: z.nativeEnum(WorkoutType, {
    error: "Invalid workout type",
  }),
  totalCount: z
    .number()
    .int()
    .nonnegative("Total count must be a non-negative integer"),
});

export const updateTotalWorkoutSchema = z.object({
  workoutType: z
    .nativeEnum(WorkoutType, {
      error: "Invalid workout type",
    })
    .optional(),
  totalCount: z
    .number()
    .int()
    .nonnegative("Total count must be a non-negative integer")
    .optional(),
});

export const totalWorkoutIdParamSchema = z.object({
  id: z.coerce.number().int().positive("Invalid total workout id"),
});
