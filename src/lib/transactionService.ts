import {
  PrismaClient,
  PrismaClient as TransactionClient,
} from "@prisma/client";
import { prisma } from "./prisma";

export interface TransactionContext {
  prisma: PrismaClient;
}
export interface TransactionServiceInterface {
  execute<T>(
    operation: (context: TransactionContext) => Promise<T>,
  ): Promise<T>;
}

export class TransactionService implements TransactionServiceInterface {
  async execute<T>(
    operation: (context: TransactionContext) => Promise<T>,
  ): Promise<T> {
    return prisma.$transaction(async (tx) => {
      return operation({ prisma: tx as PrismaClient });
    });
  }
}
