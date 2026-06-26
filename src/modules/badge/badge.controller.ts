import { Request, Response } from "express";
import badgeService from "./badge.service";
import { BadgeType, WorkoutType } from "@prisma/client";
import { WorkoutEventPayload } from "../../constants";

type AuthUser = {
  userId: string;
};

export async function handleBadgeWorkoutEvent(payload: WorkoutEventPayload) {
  const typesToEvaluate = new Set<WorkoutType>([payload.workoutType]);

  if (
    payload.event === "updated" &&
    payload.previousWorkoutType &&
    payload.previousWorkoutType !== payload.workoutType
  ) {
    typesToEvaluate.add(payload.previousWorkoutType);
  }

  for (const workoutType of typesToEvaluate) {
    await badgeService.evaluateBadgesForWorkoutType(
      payload.userId,
      workoutType,
    );
  }
}

const getBadgesController = async (req: Request, res: Response) => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const badges = await badgeService.getBadgesByUserService(userId);
    res.status(200).json({
      badges,
      success: true,
      message: "Badges fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

const getBadgeByIdController = async (req: Request, res: Response) => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const badge = await badgeService.getBadgeByIdService(
      userId,
      Number(req.params.id),
    );
    res.status(200).json({
      badge,
      success: true,
      message: "Badge fetched successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

const awardBadgeController = async (req: Request, res: Response) => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const badge = await badgeService.awardBadgeService(
      req.body.badgeType as BadgeType,
      userId,
    );
    res.status(201).json({
      badge,
      success: true,
      message: "Badge awarded successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

const deleteBadgeController = async (req: Request, res: Response) => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    await badgeService.deleteBadgeService(userId, Number(req.params.id));
    res.status(200).json({
      success: true,
      message: "Badge deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

const updateBadgeController = async (req: Request, res: Response) => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const badge = await badgeService.updateBadgeService(
      userId,
      Number(req.params.id),
      req.body.badgeType as BadgeType,
    );
    res.status(200).json({
      badge,
      success: true,
      message: "Badge updated successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export default {
  getBadgesController,
  getBadgeByIdController,
  awardBadgeController,
  updateBadgeController,
  deleteBadgeController,
};
