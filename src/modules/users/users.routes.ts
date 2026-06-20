import { Router } from "express";
import { UserRoles } from "@prisma/client";
import {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserByIdController,
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

const usersRoutes = Router();

usersRoutes.post(
  "/",
  authorisationMiddleware(UserRoles.ADMIN),
  validateBody(createUserSchema),
  createUserController,
);
usersRoutes.get(
  "/",
  authorisationMiddleware(UserRoles.ADMIN),
  getUsersController,
);
usersRoutes.get(
  "/:id",
  validateParams(userIdParamSchema),
  ownerOrAdminMiddleware,
  getUserByIdController,
);
usersRoutes.put(
  "/:id",
  validateParams(userIdParamSchema),
  ownerOrAdminMiddleware,
  validateBody(updateUserSchema),
  updateUserByIdController,
);

export default usersRoutes;
