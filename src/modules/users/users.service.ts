import { prisma } from "../../lib/prisma";
import { User, UserRoles } from "@prisma/client";
import bcrypt from "bcrypt";

export const createUserService = async (
  email: string,
  password: string,
  role?: UserRoles,
): Promise<User> => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    return await prisma.user.create({
      data: {
        email,
        passwordHash,
        ...(role !== undefined && { role }),
      },
    });
  } catch {
    throw new Error("Failed to create user with this email");
  }
};

export const getUsersService = async (): Promise<User[]> => {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    throw new Error("Failed to get users");
  }
};

export const getUserByIdService = async (id: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const getUserByEmailOrThrow = async (email: string): Promise<User> => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const updateUserByIdService = async ({
  id,
  email,
  passwordHash,
  role,
}: {
  id: string;
  email?: string;
  passwordHash?: string;
  role?: UserRoles;
}): Promise<User> => {
  try {
    return await prisma.user.update({
      where: { id },
      data: {
        ...(email !== undefined && { email }),
        ...(passwordHash !== undefined && { passwordHash }),
        ...(role !== undefined && { role }),
      },
    });
  } catch {
    throw new Error("Failed to update user by id");
  }
};
