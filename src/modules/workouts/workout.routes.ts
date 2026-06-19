import { Request, Response } from "express";
import { createWorkout } from "./workout.service";

export const addWorkoutRoutes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log("Adding workout routes", req);
  createWorkout(req, res);
};
