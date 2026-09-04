import { prisma } from '../../../database/prisma';

export class GenresRepository {
  findAll() {
    return prisma.genre.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  findById(id: string) {
    return prisma.genre.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }
}