import { Router } from "express";
import { UserRoles } from "@prisma/client";
import {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserByIdController,
  deleteUserByIdController,
  deleteAllUsersController,
} from "../controllers/users.controller";
import {
  authorisationMiddleware,
  ownerOrAdminMiddleware,
} from "../middlewares/authorisation.middleware";
import {
  validateBody,
  validateParams,
} from "../middlewares/validate.middleware";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from "../validators/users.schema";
import { authMiddleware } from "../middlewares/authentication.middleware";

const usersRoutes = Router();

usersRoutes.post("/", validateBody(createUserSchema), createUserController);
usersRoutes.get(
  "/",
  authMiddleware,
  authorisationMiddleware(UserRoles.ADMIN),
  getUsersController,
);
usersRoutes.get(
  "/:id",
  validateParams(userIdParamSchema),
  authMiddleware,
  ownerOrAdminMiddleware,
  getUserByIdController,
);
usersRoutes.put(
  "/:id",
  validateParams(userIdParamSchema),
  authMiddleware,
  ownerOrAdminMiddleware,
  validateBody(updateUserSchema),
  updateUserByIdController,
);
usersRoutes.delete(
  "/:id",
  validateParams(userIdParamSchema),
  authMiddleware,
  ownerOrAdminMiddleware,
  deleteUserByIdController,
);
usersRoutes.delete(
  "/",
  authMiddleware,
  authorisationMiddleware(UserRoles.ADMIN),
  deleteAllUsersController,
);

export default usersRoutes;
