import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "@prisma/client";
import { userRepository } from "../repositories/user.repository";
import {
  createUserService,
  getUserByEmailOrThrow,
  getUserByIdService,
} from "./users.service";

const ACCESS_TOKEN_EXPIRY_SECONDS = 60 * 60;
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

const verifyRefreshToken = (refreshToken: string): JwtPayload => {
  if (!refreshToken) {
    throw new Error("Refresh token not found");
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as JwtPayload;

    if (!payload.userId) {
      throw new Error("Invalid refresh token");
    }

    return payload;
  } catch {
    throw new Error("Invalid refresh token");
  }
};

export const getRefreshTokenRemainingSeconds = (
  refreshToken: string,
): number => {
  const { exp } = verifyRefreshToken(refreshToken);
  if (!exp) {
    return REFRESH_TOKEN_EXPIRY_SECONDS;
  }

  return Math.max(exp - Math.floor(Date.now() / 1000), 1);
};

export const loginUserService = async (email: string, password: string) => {
  const user = await getUserByEmailOrThrow(email);
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  const tokens = await setTokensService(user);
  return { user, tokens };
};

export const setTokensService = async (
  user: User,
  refreshTokenExpirySeconds: number = REFRESH_TOKEN_EXPIRY_SECONDS,
  accessTokenExpirySeconds: number = ACCESS_TOKEN_EXPIRY_SECONDS,
) => {
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: accessTokenExpirySeconds },
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: refreshTokenExpirySeconds },
  );
  await userRepository.update(user.id, { token: refreshToken });
  return {
    accessToken,
    refreshToken,
    accessTokenExpiry: accessTokenExpirySeconds * 1000,
    refreshTokenExpiry: refreshTokenExpirySeconds * 1000,
  };
};

export const refreshTokenService = async (refreshToken: string) => {
  const { userId } = verifyRefreshToken(refreshToken);
  const user = await getUserByIdService(userId as string);

  if (user.token !== refreshToken) {
    throw new Error("Refresh token not found");
  }

  return {
    success: true,
    message: "Token refreshed successfully",
    user,
  };
};

export const logoutUserService = async (refreshToken: string) => {
  const { userId } = verifyRefreshToken(refreshToken);
  await userRepository.update(userId as string, { token: null });
  return {
    success: true,
    message: "User logged out successfully",
  };
};

export const registerUserService = async (email: string, password: string) => {
  const user = await createUserService(email, password);
  return {
    success: true,
    message: "User registered successfully",
    user,
  };
};
