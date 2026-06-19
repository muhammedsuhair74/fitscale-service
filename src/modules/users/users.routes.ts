import { Request, Response } from "express";
import { createUser as createUserService } from "./users.service";

const createUserRoutes = async (req: Request, res: Response): Promise<void> => {
  console.log("Creating user", req);
  createUserService(req, res);
};

export default createUserRoutes;
