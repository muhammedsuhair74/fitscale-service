import { Request, Response } from "express";
import {
  createTotalWorkoutService,
  deleteTotalWorkoutService,
  getAllTotalWorkoutsService,
  getTotalWorkoutByIdService,
  getTotalWorkoutsByUserService,
  updateTotalWorkoutService,
} from "../services/total-workout.service";

type AuthUser = { userId: string };

export const getTotalWorkoutsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const totalWorkouts = await getTotalWorkoutsByUserService(userId);
    res.status(200).json({
      totalWorkouts,
      success: true,
      message:
        totalWorkouts.length > 0
          ? "Total workouts fetched successfully"
          : "No total workout records found",
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const getAllTotalWorkoutsController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const totalWorkouts = await getAllTotalWorkoutsService();
    res.status(200).json({
      totalWorkouts,
      success: true,
      message: "Total workouts fetched successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const getTotalWorkoutByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const totalWorkout = await getTotalWorkoutByIdService(
      userId,
      Number(req.params.id),
    );
    res.status(200).json({
      totalWorkout,
      success: true,
      message: "Total workout fetched successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const createTotalWorkoutController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const { workoutType, totalCount } = req.body;
    const totalWorkout = await createTotalWorkoutService(
      userId,
      workoutType,
      totalCount,
    );
    res.status(201).json({
      totalWorkout,
      success: true,
      message: "Total workout created successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const updateTotalWorkoutController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const { workoutType, totalCount } = req.body;
    const totalWorkout = await updateTotalWorkoutService(
      userId,
      Number(req.params.id),
      workoutType,
      totalCount,
    );
    res.status(200).json({
      totalWorkout,
      success: true,
      message: "Total workout updated successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const deleteTotalWorkoutController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    await deleteTotalWorkoutService(userId, Number(req.params.id));
    res.status(200).json({
      success: true,
      message: "Total workout deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: (error as Error).message,
      success: false,
    });
  }
};
