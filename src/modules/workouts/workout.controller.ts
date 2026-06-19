import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const createWorkout = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log("Creating workout", req);
  const workout = await prisma.workout.create({
    data: {
      workoutType: "PUSHUP",
      count: 10,
      user: {
        connect: {
          id: req.body.userId,
        },
      },
    },
  });
  res.status(201).json(workout);
};
