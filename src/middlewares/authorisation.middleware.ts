import { UserRoles } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

type AuthUser = {
  userId: string;
  role: UserRoles;
};

const getAuthUser = (req: Request): AuthUser | null => {
  const user = (req as Request & { user?: AuthUser }).user;
  if (!user?.userId || !user?.role) {
    return null;
  }
  return user;
};

export const authorisationMiddleware = (role: UserRoles) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    if (user.role !== role) {
      return res.status(403).json({
        message: "Forbidden",
        success: false,
      });
    }
    next();
  };
};

export const ownerOrAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }
  if (user.role === UserRoles.ADMIN || user.userId === req.params.id) {
    return next();
  }
  return res.status(403).json({
    message: "Forbidden",
    success: false,
  });
};
