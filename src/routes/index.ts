import { Router } from "express";
import workoutRoutes from "../modules/workouts/workout.routes";
import usersRoutes from "../modules/users/users.routes";

const router = Router();

router.use("/workouts", workoutRoutes);
router.use("/users", usersRoutes);

export default router;
