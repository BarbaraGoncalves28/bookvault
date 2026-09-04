import type { Prisma } from '../../../../../generated/prisma/client';

import { prisma } from '../../../database/prisma';

export class UsersRepository {
  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
}
