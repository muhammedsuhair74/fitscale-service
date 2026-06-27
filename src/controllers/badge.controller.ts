import { Request, Response } from "express";
import { BadgeType } from "@prisma/client";
import {
  awardBadgeService,
  deleteBadgeService,
  getBadgeByIdService,
  getBadgesByUserService,
  updateBadgeService,
} from "../services/badge.service";

type AuthUser = { userId: string };

export const getBadgesController = async (req: Request, res: Response) => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const badges = await getBadgesByUserService(userId);
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

export const getBadgeByIdController = async (req: Request, res: Response) => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const badge = await getBadgeByIdService(userId, Number(req.params.id));
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

export const awardBadgeController = async (req: Request, res: Response) => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const badge = await awardBadgeService(req.body.badgeType as BadgeType, userId);
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

export const deleteBadgeController = async (req: Request, res: Response) => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    await deleteBadgeService(userId, Number(req.params.id));
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

export const updateBadgeController = async (req: Request, res: Response) => {
  try {
    const { userId } = (req as Request & { user: AuthUser }).user;
    const badge = await updateBadgeService(
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
