import { Request, Response, Router } from "express";
import { createWorkout, getWorkouts } from "./workout.service";

const workoutRoutes = Router();

workoutRoutes.post("/", createWorkout);
workoutRoutes.get("/", getWorkouts);

export default workoutRoutes;
