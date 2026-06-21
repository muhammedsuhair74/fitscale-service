import { Router } from "express";
import {
  createWorkoutController,
  getWorkoutsController,
  getWorkoutByIdController,
} from "./workout.controller";
import {
  validateBody,
  validateParams,
} from "../../middleware/validate.middleware";
import {
  createWorkoutSchema,
  workoutIdParamSchema,
} from "../../validators/workouts.schema";

const workoutRoutes = Router();

workoutRoutes.post(
  "/",
  validateBody(createWorkoutSchema),
  createWorkoutController,
);
workoutRoutes.get("/", getWorkoutsController);
workoutRoutes.get(
  "/:id",
  validateParams(workoutIdParamSchema),
  getWorkoutByIdController,
);

export default workoutRoutes;
