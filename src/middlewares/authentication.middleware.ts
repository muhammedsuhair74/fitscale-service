import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
      success: false,
    });
  }
}
