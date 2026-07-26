import { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

export const requestMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.headers["x-correlation-id"]) {
    next();
    return;
  }
  req.headers["x-correlation-id"] = randomUUID();
  next();
};
