import { Request, Response } from "express";
import { createWorkoutService, getWorkoutsService } from "./workout.service";

type AuthUser = {
  userId: string;
};

export const createWorkoutController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const { workoutType, count } = req.body;
    const workout = await createWorkoutService(userId, workoutType, count);
    res.status(201).json({
      workout,
      success: true,
      message: "Workout created successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const getWorkoutsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const workouts = await getWorkoutsService(userId);
    res.status(200).json({
      workouts,
      success: true,
      message: "Workouts fetched successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};
