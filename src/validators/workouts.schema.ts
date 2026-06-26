import { z } from "zod";
import { WorkoutType } from "@prisma/client";

export const createWorkoutSchema = z.object({
  workoutType: z.nativeEnum(WorkoutType, {
    error: "Invalid workout type",
  }),
  count: z.number().int().positive("Count must be a positive integer"),
});

export const workoutIdParamSchema = z.object({
  id: z.string().uuid("Invalid workout id"),
});

export const updateWorkoutSchema = z.object({
  workoutType: z.nativeEnum(WorkoutType, {
    error: "Invalid workout type",
  }),
  count: z.number().int().positive("Count must be a positive integer"),
});
