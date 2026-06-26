import { Router } from "express";
import {
  createWorkoutController,
  deleteWorkoutController,
  getWorkoutsController,
  getWorkoutByIdController,
  updateWorkoutController,
} from "./workout.controller";
import {
  validateBody,
  validateParams,
} from "../../middleware/validate.middleware";
import {
  createWorkoutSchema,
  workoutIdParamSchema,
  updateWorkoutSchema,
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
workoutRoutes.put(
  "/:id",
  validateParams(workoutIdParamSchema),
  validateBody(updateWorkoutSchema),
  updateWorkoutController,
);
workoutRoutes.delete(
  "/:id",
  validateParams(workoutIdParamSchema),
  deleteWorkoutController,
);

export default workoutRoutes;
