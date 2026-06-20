import { Router } from "express";
import workoutRoutes from "../modules/workouts/workout.routes";
import usersRoutes from "../modules/users/users.routes";
import authRoutes from "../modules/auth/auth.routes";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workouts", authMiddleware, workoutRoutes);
router.use("/users", authMiddleware, usersRoutes);

export default router;
