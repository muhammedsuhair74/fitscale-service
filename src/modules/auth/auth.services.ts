import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUserService = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new Error("User not found");
  }
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }
  return user;
};

export const refreshTokenService = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new Error("Refresh token not found");
  }
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  return decoded;
};

export const logoutUserService = async (req: Request, res: Response) => {
  return {
    success: true,
    message: "User logged out successfully",
  };
};

export const registerUserService = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new Error("User already exists");
  }
  const user = await prisma.user.create({
    data: { email, passwordHash: await bcrypt.hash(password, 10) },
  });
  return {
    success: true,
    message: `${user.email} registered successfully`,
    user,
  };
};
