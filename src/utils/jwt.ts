import { UserRoles } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  role: UserRoles;
}

export const ACCESS_TOKEN_EXPIRY_SECONDS = 60 * 60;
export const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

export const generateAccessToken = (payload: {
  userId: string;
  role: UserRoles;
}) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  if (!payload.userId) {
    throw new Error("userId is required");
  }
  if (!payload.role) {
    throw new Error("role is required");
  }

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.verify(token, process.env.JWT_SECRET!) as AccessTokenPayload;
};

export const decodeAccessToken = (token: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.decode(token);
};

export const generateRefreshToken = (payload: { userId: string }) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not set");
  }
  if (!payload.userId) {
    throw new Error("userId is required");
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRY_SECONDS,
  });
};

export const verifyRefreshToken = (token: string) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not set");
  }
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
};

export const decodeRefreshToken = (token: string) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not set");
  }
  return jwt.decode(token);
};
