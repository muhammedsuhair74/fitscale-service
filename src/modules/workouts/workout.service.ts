import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const getWorkouts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log("Getting workouts", req);
  const workouts = await prisma.workout.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(workouts);
};

export const createWorkout = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log("Creating workout", req);
  const workout = await prisma.workout.create({
    data: {
      workoutType: req.body.workoutType,
      count: req.body.count,
      userId: req.body.userId,
    },
  });
  res.status(201).json(workout);
};
