import { Router } from "express";
import { UserRoles } from "@prisma/client";
import {
  createTotalWorkoutController,
  deleteTotalWorkoutController,
  getAllTotalWorkoutsController,
  getTotalWorkoutByIdController,
  getTotalWorkoutsController,
  updateTotalWorkoutController,
} from "../controllers/total-workout.controller";
import { authorisationMiddleware } from "../middlewares/authorisation.middleware";
import {
  validateBody,
  validateParams,
} from "../middlewares/validate.middleware";
import {
  createTotalWorkoutSchema,
  totalWorkoutIdParamSchema,
  updateTotalWorkoutSchema,
} from "../validators/total-workouts.schema";

const totalWorkoutRoutes = Router();

totalWorkoutRoutes.get(
  "/all",
  authorisationMiddleware(UserRoles.ADMIN),
  getAllTotalWorkoutsController,
);
totalWorkoutRoutes.get("/", getTotalWorkoutsController);
totalWorkoutRoutes.get(
  "/:id",
  validateParams(totalWorkoutIdParamSchema),
  getTotalWorkoutByIdController,
);
totalWorkoutRoutes.post(
  "/",
  validateBody(createTotalWorkoutSchema),
  createTotalWorkoutController,
);
totalWorkoutRoutes.put(
  "/:id",
  validateParams(totalWorkoutIdParamSchema),
  validateBody(updateTotalWorkoutSchema),
  updateTotalWorkoutController,
);
totalWorkoutRoutes.delete(
  "/:id",
  validateParams(totalWorkoutIdParamSchema),
  deleteTotalWorkoutController,
);

export default totalWorkoutRoutes;
