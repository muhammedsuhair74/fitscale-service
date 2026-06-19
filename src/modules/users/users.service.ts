import { Request, Response } from "express";
import { createUser as createUserServiceController } from "./users.controllers";
import { prisma } from "../../lib/prisma";

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log("Creating user", req);
  const user = await prisma.user.create({
    data: {
      email: req.body?.email,
      passwordHash: req.body?.passwordHash,
    },
  });
  res.status(201).json(user);
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  console.log("Getting users", req);
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(users);
};
