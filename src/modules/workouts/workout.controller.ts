import { Request, Response } from "express";
import {
  createWorkoutService,
  deleteWorkoutService,
  editWorkoutService,
  getWorkoutByIdService,
  getWorkoutsService,
} from "./workout.service";

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

export const getWorkoutByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const { id } = req.params;
    const workout = await getWorkoutByIdService(userId, id as string);
    res.status(200).json({
      workout,
      success: true,
      message: "Workout fetched successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const updateWorkoutController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const { id } = req.params;
    const { workoutType, count } = req.body;
    const workout = await editWorkoutService(
      userId,
      id as string,
      workoutType,
      count,
    );

    res.status(200).json({
      workout,
      success: true,
      message: "Workout updated successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const deleteWorkoutController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const { id } = req.params;
    await deleteWorkoutService(userId, id as string);

    res.status(200).json({
      success: true,
      message: "Workout deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: (error as Error).message,
      success: false,
    });
  }
};
