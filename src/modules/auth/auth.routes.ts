import { Router } from "express";
import {
  loginUserController,
  logoutUserController,
  registerUserController,
} from "./auth.controllers";

const authRoutes = Router();

console.log("Auth routes");

authRoutes.post("/login", loginUserController);
authRoutes.post("/logout", logoutUserController);
authRoutes.post("/register", registerUserController);

export default authRoutes;
