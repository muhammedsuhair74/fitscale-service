import { UserRoles } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  role: UserRoles;
}
