import { Request, Response } from "express";
import { createWorkout as createWorkoutController } from "./workout.controller";

export const createWorkout = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log("Creating workout", req);
  await createWorkoutController(req, res);
};
