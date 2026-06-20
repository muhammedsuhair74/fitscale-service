import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import {
  createUser as createUserService,
  getUsers as getUsersService,
} from "./users.service";

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log("Creating user", req);
  const user = await createUserService(req, res);
  res.status(201).json({
    user,
    success: true,
    message: "User created successfully",
  });
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  console.log("Getting users", req);
  const users = await getUsersService(req, res);
  res.status(200).json({
    users,
    success: true,
    message: "Users fetched successfully",
  });
};
