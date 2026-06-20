import { Request, Response } from "express";
import { createWorkout as createWorkoutService } from "./workout.service";

export const createWorkout = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log("Creating workout", req);
  const workout = await createWorkoutService(req, res);
  res.status(201).json({
    workout,
    success: true,
    message: "Workout created successfully",
  });
};

export const getWorkouts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log("Getting workouts", req);
  const workouts = await getWorkoutsService(req, res);
  res.status(200).json({
    workouts,
    success: true,
    message: "Workouts fetched successfully",
  });
};
