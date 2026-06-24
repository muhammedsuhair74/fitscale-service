import { Request, Response } from "express";

import badgeService from "./badge.service.js";
import { BadgeType } from "@prisma/client";

const getBadgesController = async (req: Request, res: Response) => {
  try {
    const badges = await badgeService.getBadgesService();
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

const getBadgeByIdController = async (req: Request, res: Response) => {
  try {
    const badge = await badgeService.getBadgeByIdService(String(req.params.id));
    res.json(badge);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

const awardBadgeController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const badge = await badgeService.awardBadgeService(
      req.body.badgeType as BadgeType,
      userId,
    );
    res.json(badge);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
const deleteBadgeController = async (req: Request, res: Response) => {
  try {
    await badgeService.deleteBadgeService(Number(req.params.id));
    res.json({ message: "Badge deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

const updateBadgeController = async (req: Request, res: Response) => {
  try {
    const badge = await badgeService.updateBadgeService(
      Number(req.params.id),
      req.body,
    );
    res.json(badge);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export async function evaluatePushupBadges(userId: string) {
  const total = await badgeService.getTotalPushupsService(userId);

  if (total >= 100) {
    await badgeService.awardBadgeService("BRONZE_PUSHUP", userId);
  }

  if (total >= 500) {
    await badgeService.awardBadgeService("SILVER_PUSHUP", userId);
  }

  if (total >= 1000) {
    await badgeService.awardBadgeService("GOLD_PUSHUP", userId);
  }
}

export default {
  getBadgesController,
  getBadgeByIdController,
  awardBadgeController,
  updateBadgeController,
  deleteBadgeController,
};
