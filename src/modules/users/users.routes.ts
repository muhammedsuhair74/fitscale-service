import { Router } from "express";
import { UserRoles } from "@prisma/client";
import {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserByIdController,
  deleteUserByIdController,
  deleteAllUsersController,
} from "./users.controllers";
import {
  authorisationMiddleware,
  ownerOrAdminMiddleware,
} from "../../middleware/authorisation.middleware";
import {
  validateBody,
  validateParams,
} from "../../middleware/validate.middleware";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from "../../validators/users.schema";
import { authMiddleware } from "../../middleware/authentication.middleware";

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
export default usersRoutes;

usersRoutes.delete(
  "/",
  authMiddleware,
  authorisationMiddleware(UserRoles.ADMIN),
  deleteAllUsersController,
);
