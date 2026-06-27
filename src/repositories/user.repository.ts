import { User, UserRoles } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findMany() {
    return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  },

  create(data: { email: string; passwordHash: string; role?: UserRoles }) {
    return prisma.user.create({ data });
  },

  update(
    id: string,
    data: { email?: string; passwordHash?: string; role?: UserRoles; token?: string | null },
  ) {
    return prisma.user.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },

  deleteManyNonAdmin() {
    return prisma.user.deleteMany({
      where: { role: { not: UserRoles.ADMIN } },
    });
  },
};
