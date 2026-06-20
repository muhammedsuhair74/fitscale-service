import { Router } from "express";
import workoutRoutes from "../modules/workouts/workout.routes";
import usersRoutes from "../modules/users/users.routes";
import authRoutes from "../modules/auth/auth.routes";

const router = Router();

router.use("/workouts", workoutRoutes);
router.use("/users", usersRoutes);
router.use("/auth", authRoutes);

export default router;
