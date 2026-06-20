import { Router } from "express";
import {
  createWorkoutController,
  getWorkoutsController,
} from "./workout.controller";
import { validateBody } from "../../middleware/validate.middleware";
import { createWorkoutSchema } from "../../validators/workouts.schema";

const workoutRoutes = Router();

workoutRoutes.post(
  "/",
  validateBody(createWorkoutSchema),
  createWorkoutController,
);
workoutRoutes.get("/", getWorkoutsController);

export default workoutRoutes;
