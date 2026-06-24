import { Router } from "express";
import badgeController from "./badge.controller.js";
const router = Router();

router.get("/", badgeController.getBadgesController);
router.get("/:id", badgeController.getBadgeByIdController);
router.post("/", badgeController.awardBadgeController);
router.put("/:id", badgeController.updateBadgeController);
router.delete("/:id", badgeController.deleteBadgeController);

export default router;
