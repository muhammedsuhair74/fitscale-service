import { Request, Response } from "express";
import {
  loginUserService,
  logoutUserService,
  registerUserService,
} from "./auth.services";
import jwt from "jsonwebtoken";

export const loginUserController = async (req: Request, res: Response) => {
  try {
    const user = await loginUserService(req, res);
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );
    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Secure; Max-Age=3600000; Path=/`,
    );
    res.status(200).json({
      user: user,
      success: true,
      message: "User logged in successfully",
    });
  } catch (error) {
    console.error("Error logging in user:", (error as Error).message);
    res.status(401).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const logoutUserController = async (req: Request, res: Response) => {
  try {
    const result = await logoutUserService(req, res);
    res.clearCookie("token");
    res.status(200).json({
      message: result.message,
      success: result.success,
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const registerUserController = async (req: Request, res: Response) => {
  try {
    const result = await registerUserService(req, res);
    res.status(201).json({
      user: result.user,
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};
