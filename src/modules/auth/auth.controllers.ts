import { Request, Response } from "express";
import {
  loginUserService,
  logoutUserService,
  registerUserService,
  refreshTokenService,
} from "./auth.services";
import jwt, { JwtPayload } from "jsonwebtoken";

export const loginUserController = async (req: Request, res: Response) => {
  try {
    const user = await loginUserService(req, res);
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" },
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000,
      path: "/",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 604800000,
      path: "/",
    });
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

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const result = (await refreshTokenService(req, res)) as JwtPayload;
    const oldRefreshToken = req.cookies?.refreshToken;
    const expiryOfOldRefreshToken = (
      jwt.verify(
        oldRefreshToken,
        process.env.JWT_REFRESH_SECRET as string,
      ) as JwtPayload
    ).exp;
    const newRefreshTokenExpiry = expiryOfOldRefreshToken
      ? expiryOfOldRefreshToken - Date.now()
      : 604800000;

    const accessToken = jwt.sign(
      { userId: result.userId },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );
    const refreshToken = jwt.sign(
      { userId: result.userId },
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: newRefreshTokenExpiry,
      },
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000,
      path: "/",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: newRefreshTokenExpiry,
      path: "/",
    });
    res.status(200).json({
      user: result,
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Error refreshing token:", (error as Error).message);
    res.status(401).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const logoutUserController = async (req: Request, res: Response) => {
  try {
    const result = await logoutUserService(req, res);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
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
