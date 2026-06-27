import { Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  path: "/",
} as const;

export const setAuthCookies = (
  res: Response,
  tokens: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: number;
    refreshTokenExpiry: number;
  },
) => {
  res.cookie("accessToken", tokens.accessToken, {
    ...authCookieOptions,
    maxAge: tokens.accessTokenExpiry,
  });
  res.cookie("refreshToken", tokens.refreshToken, {
    ...authCookieOptions,
    maxAge: tokens.refreshTokenExpiry,
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", authCookieOptions);
  res.clearCookie("refreshToken", authCookieOptions);
};
