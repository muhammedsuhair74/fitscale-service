import { User, UserRoles } from "@prisma/client";
import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository";
import { redis } from "../lib/redis";
import { cacheKeys, WORKOUT_CACHE_TTL_SECONDS } from "../lib/constants";

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
    const user = await userRepository.create({
      email,
      passwordHash,
      ...(role !== undefined && { role }),
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
    return JSON.parse(cachedData) as User[];
  }

  const data = await userRepository.findMany();
  await redis.set(cacheKeys.allUsers, JSON.stringify(data), {
    EX: WORKOUT_CACHE_TTL_SECONDS,
  });
  return data;
};

export const getUserByIdService = async (id: string): Promise<User> => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return userRepository.findByEmail(email);
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
    const user = await userRepository.update(id, {
      ...(email !== undefined && { email }),
      ...(passwordHash !== undefined && { passwordHash }),
      ...(role !== undefined && { role }),
    });
    await redis.del(cacheKeys.allUsers);
    return user;
  } catch {
    throw new Error("Failed to update user by id");
  }
};

export const deleteUserByIdService = async (id: string): Promise<void> => {
  try {
    await userRepository.delete(id);
    await redis.del(cacheKeys.allUsers);
  } catch {
    throw new Error("Failed to delete user by id");
  }
};

export const deleteAllUsersService = async (): Promise<void> => {
  try {
    await userRepository.deleteManyNonAdmin();
    await redis.del(cacheKeys.allUsers);
  } catch {
    throw new Error("Failed to delete all users");
  }
};
