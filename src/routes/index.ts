import { Router } from "express";
import workoutRoutes from "../modules/workouts/workout.routes";
import totalWorkoutRoutes from "../modules/total-workouts/total-workouts.routes";
import badgeRoutes from "../modules/badge/badge.routes";
import usersRoutes from "../modules/users/users.routes";
import authRoutes from "../modules/auth/auth.routes";
import { authMiddleware } from "../middleware/authentication.middleware";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workouts", authMiddleware, workoutRoutes);
router.use("/total-workouts", authMiddleware, totalWorkoutRoutes);
router.use("/badges", authMiddleware, badgeRoutes);
router.use("/users", usersRoutes);

export default router;
