import { Router } from "express";
import {
  awardBadgeController,
  deleteBadgeController,
  getBadgeByIdController,
  getBadgesController,
  updateBadgeController,
} from "../controllers/badge.controller";

const badgeRoutes = Router();

badgeRoutes.get("/", getBadgesController);
badgeRoutes.get("/:id", getBadgeByIdController);
badgeRoutes.post("/", awardBadgeController);
badgeRoutes.put("/:id", updateBadgeController);
badgeRoutes.delete("/:id", deleteBadgeController);

export default badgeRoutes;
