import { Router } from "express";
import authRoutes from "./authentication/auth.routes";
import usersRoutes from "./users/users.routes";
import workoutRoutes from "./workouts/workout.routes";
import totalWorkoutRoutes from "./totalWorkout/total-workout.routes";
import badgeRoutes from "./badge/badge.routes";
import notificationRoutes from "./notifications/notification.routes";
import { authMiddleware } from "../middlewares/authentication.middleware";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/workouts", authMiddleware, workoutRoutes);
router.use("/total-workouts", authMiddleware, totalWorkoutRoutes);
router.use("/badges", authMiddleware, badgeRoutes);
router.use("/notifications", authMiddleware, notificationRoutes);

export default router;
