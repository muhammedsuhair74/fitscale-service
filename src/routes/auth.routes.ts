import { Router } from "express";
import {
  loginUserController,
  logoutUserController,
  registerUserController,
  refreshTokenController,
} from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../validators/auth.schema";

const authRoutes = Router();

authRoutes.post("/login", validateBody(loginSchema), loginUserController);
authRoutes.post("/logout", logoutUserController);
authRoutes.post(
  "/register",
  validateBody(registerSchema),
  registerUserController,
);
authRoutes.post("/refresh-token", refreshTokenController);

export default authRoutes;
