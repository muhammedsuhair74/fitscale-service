import { prisma } from "../../lib/prisma";
import { User, UserRoles } from "@prisma/client";
import bcrypt from "bcrypt";
import { redis } from "../../lib/redis";
import { cacheKeys, WORKOUT_CACHE_TTL_SECONDS } from "../../constants";

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
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        ...(role !== undefined && { role }),
      },
    });
    await redis.del(cacheKeys.allUsers);
    return user;
  } catch {
    throw new Error("Failed to create user with this email");
  }
};

export const getUsersService = async (): Promise<User[]> => {
  const cachedData = await redis.get(cacheKeys.allUsers);
  if (cachedData) {
    console.log("Redis Hit");
    return JSON.parse(cachedData) as User[];
  }

  console.log("Redis Miss");

  try {
    const data = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    await redis.set(cacheKeys.allUsers, JSON.stringify(data), {
      EX: WORKOUT_CACHE_TTL_SECONDS,
    });
    return data;
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
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(email !== undefined && { email }),
        ...(passwordHash !== undefined && { passwordHash }),
        ...(role !== undefined && { role }),
      },
    });
    await redis.del(cacheKeys.allUsers);
    return user;
  } catch {
    throw new Error("Failed to update user by id");
  }
};

export const deleteUserByIdService = async (id: string): Promise<void> => {
  try {
    await prisma.user.delete({
      where: { id },
    });
    await redis.del(cacheKeys.allUsers);
  } catch {
    throw new Error("Failed to delete user by id");
  }
};

export const deleteAllUsersService = async (): Promise<void> => {
  try {
    await prisma.user.deleteMany({
      where: {
        role: {
          not: UserRoles.ADMIN,
        },
      },
    });
    await redis.del(cacheKeys.allUsers);
  } catch {
    throw new Error("Failed to delete all users");
  }
};
