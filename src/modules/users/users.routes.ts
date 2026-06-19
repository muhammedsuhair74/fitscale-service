import { Router } from "express";
import { createUser, getUsers } from "./users.controllers";

const usersRoutes = Router();

usersRoutes.post("/", createUser);
usersRoutes.get("/", getUsers);
// usersRoutes.get("/:id", getUserById);
// usersRoutes.put("/:id", updateUser);
// usersRoutes.delete("/:id", deleteUser);

export default usersRoutes;
