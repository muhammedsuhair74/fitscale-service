import { Request, Response } from "express";
import {
  loginUserService,
  logoutUserService,
  registerUserService,
  refreshTokenService,
  setTokensService,
  getRefreshTokenRemainingSeconds,
} from "../services/auth.service";
import { setAuthCookies, clearAuthCookies } from "../lib/auth.utils";
import { sanitizeUser } from "../lib/user.utils";

export const loginUserController = async (req: Request, res: Response) => {
  try {
    const result = await loginUserService(req.body.email, req.body.password);
    setAuthCookies(res, result.tokens);
    res.status(200).json({
      user: sanitizeUser(result.user),
      success: true,
      message: "User logged in successfully",
    });
  } catch (error) {
    res.status(401).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken as string;
    const result = await refreshTokenService(oldRefreshToken);
    const remainingRefreshSeconds =
      getRefreshTokenRemainingSeconds(oldRefreshToken);
    const tokens = await setTokensService(result.user, remainingRefreshSeconds);

    setAuthCookies(res, tokens);
    res.status(200).json({
      user: sanitizeUser(result.user),
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    res.status(401).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const logoutUserController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken as string;
    const result = await logoutUserService(refreshToken);
    clearAuthCookies(res);
    res.status(200).json({
      message: result.message,
      success: result.success,
    });
  } catch (error) {
    res.status(401).json({
      message: (error as Error).message,
      success: false,
    });
  }
};

export const registerUserController = async (req: Request, res: Response) => {
  try {
    const result = await registerUserService(req.body.email, req.body.password);
    res.status(201).json({
      user: sanitizeUser(result.user),
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      success: false,
    });
  }
};
