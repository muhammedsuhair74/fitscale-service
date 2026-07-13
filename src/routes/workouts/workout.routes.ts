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
} from "../../middlewares/validate.middleware";
import {
  createWorkoutSchema,
  workoutIdParamSchema,
  updateWorkoutSchema,
} from "../../validators/workouts.schema";
import { authMiddleware } from "../../middlewares/authentication.middleware";

const workoutRoutes = Router();

workoutRoutes.post(
  "/",
  authMiddleware,
  validateBody(createWorkoutSchema),
  createWorkoutController,
);
workoutRoutes.get("/", authMiddleware, getWorkoutsController);
workoutRoutes.get(
  "/:id",
  authMiddleware,
  validateParams(workoutIdParamSchema),
  getWorkoutByIdController,
);
workoutRoutes.put(
  "/:id",
  authMiddleware,
  validateParams(workoutIdParamSchema),
  validateBody(updateWorkoutSchema),
  updateWorkoutController,
);
workoutRoutes.delete(
  "/:id",
  authMiddleware,
  validateParams(workoutIdParamSchema),
  deleteWorkoutController,
);

export default workoutRoutes;
