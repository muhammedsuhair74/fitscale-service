import { Request, Response } from "express";
import { createUser as createUserServiceController } from "./users.controllers";

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log("Creating user", req);
  await createUserServiceController(req, res);
};
