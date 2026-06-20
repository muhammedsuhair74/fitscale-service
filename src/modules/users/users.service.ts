import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { User } from "@prisma/client";

export const createUser = async (
  req: Request,
  res: Response,
): Promise<User> => {
  console.log("Creating user", req);
  const user = await prisma.user.create({
    data: {
      email: req.body?.email,
      passwordHash: req.body?.passwordHash,
    },
  });
  return user;
};

export const getUsers = async (
  req: Request,
  res: Response,
): Promise<User[]> => {
  console.log("Getting users", req);
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  return users;
};

export const getUser = async (req: Request, res: Response): Promise<User> => {
  const id = req.params.id as string;
  if (!id) {
    throw new Error("User ID is required");
  }
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};
