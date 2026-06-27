import { Router } from "express";
import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";
import workoutRoutes from "./workout.routes";
import totalWorkoutRoutes from "./total-workout.routes";
import badgeRoutes from "./badge.routes";
import notificationRoutes from "./notification.routes";
import { authMiddleware } from "../middlewares/authentication.middleware";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/workouts", authMiddleware, workoutRoutes);
router.use("/total-workouts", authMiddleware, totalWorkoutRoutes);
router.use("/badges", authMiddleware, badgeRoutes);
router.use("/notifications", authMiddleware, notificationRoutes);

export default router;
