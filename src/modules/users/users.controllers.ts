import { Request, Response } from "express";
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
