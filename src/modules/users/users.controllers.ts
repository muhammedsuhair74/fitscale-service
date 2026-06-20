import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import {
  createUser as createUserService,
  getUsers as getUsersService,
  getUser as getUserService,
} from "./users.service";
import { User } from "@prisma/client";

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

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getUserService(req, res);
    res.status(200).json({
      user: user,
      success: true,
      message: `User fetched successfully`,
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};
