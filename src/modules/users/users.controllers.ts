import { Request, Response } from "express";
import { UserRoles } from "@prisma/client";
import {
  createUserService,
  getUsersService,
  getUserByIdService,
  findUserByEmail,
  updateUserByIdService,
  deleteUserByIdService,
  deleteAllUsersService,
} from "./users.service";
import { hash } from "bcrypt";
import { sanitizeUser, sanitizeUsers } from "../../utils/user";

export const createUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password, role } = req.body;
    const user = await createUserService(email, password, role);
    res.status(201).json({
      user: sanitizeUser(user),
      success: true,
      message: `${user.email} created successfully`,
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const getUsersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await getUsersService();
    res.status(200).json({
      users: sanitizeUsers(users),
      success: true,
      message: "Users fetched successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const getUserByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await getUserByIdService(req.params.id as string);
    res.status(200).json({
      user: sanitizeUser(user),
      success: true,
      message: "User fetched successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const getUserByEmailController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await findUserByEmail(req.body.email);
    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).json({
      user: sanitizeUser(user),
      success: true,
      message: "User fetched successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const updateUserByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password, role } = req.body;
    const passwordHash = password ? await hash(password, 10) : undefined;
    const user = await updateUserByIdService({
      id: req.params.id as string,
      ...(email !== undefined && { email }),
      ...(passwordHash !== undefined && { passwordHash }),
      ...(role !== undefined && { role: role as UserRoles }),
    });
    res.status(200).json({
      user: sanitizeUser(user),
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const deleteUserByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await deleteUserByIdService(req.params.id as string);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const deleteAllUsersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await deleteAllUsersService();
    res.status(200).json({
      success: true,
      message: "All users deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};
