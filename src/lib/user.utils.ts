import { User } from "@prisma/client";

export const sanitizeUser = (user: User) => {
  const { passwordHash, token, ...safeUser } = user;
  return safeUser;
};

export const sanitizeUsers = (users: User[]) => users.map(sanitizeUser);
