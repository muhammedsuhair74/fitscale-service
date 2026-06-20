import { Router } from "express";
import {
  loginUserController,
  logoutUserController,
  registerUserController,
  refreshTokenController,
} from "./auth.controllers";

const authRoutes = Router();

console.log("Auth routes");

authRoutes.post("/login", loginUserController);
authRoutes.post("/logout", logoutUserController);
authRoutes.post("/register", registerUserController);
authRoutes.post("/refresh-token", refreshTokenController);

export default authRoutes;
