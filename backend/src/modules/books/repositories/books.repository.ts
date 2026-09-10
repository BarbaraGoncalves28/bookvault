import type { Prisma } from '../../../../../generated/prisma/client';

import { prisma } from '../../../database/prisma';
import type {
  BookFiltersDTO,
  CreateBookDTO,
  UpdateBookDTO,
} from '../dtos/book.dto';

export class BooksRepository {
  create(userId: string, data: CreateBookDTO) {
    const {
      genreIds,
      ...bookData
    } = data;

    return prisma.book.create({
      data: {
        ...bookData,

        user: {
          connect: {
            id: userId,
          },
        },

        genres: {
          create: genreIds.map((genreId) => ({
            genre: {
              connect: {
                id: genreId,
              },
            },
          })),
        },
      },

      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });
  }

  async findManyByUserId(
  userId: string,
  filters: BookFiltersDTO,
) {
  const page = filters.page ?? 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  const where: Prisma.BookWhereInput = {
    userId,

    ...(filters.status !== undefined
      ? {
          status: filters.status,
        }
      : {}),

    ...(filters.favorite !== undefined
      ? {
          favorite: filters.favorite,
        }
      : {}),

    ...(filters.title
      ? {
          title: {
            contains: filters.title,
            mode: 'insensitive',
          },
        }
      : {}),

    ...(filters.genreId
      ? {
          genres: {
            some: {
              genreId: filters.genreId,
            },
          },
        }
      : {}),

    ...(filters.minRating !== undefined
      ? {
          rating: {
            gte: filters.minRating,
          },
        }
      : {}),
  };

  let orderBy: Prisma.BookOrderByWithRelationInput[];

  switch (filters.sort) {
    case 'title_asc':
      orderBy = [
        { title: 'asc' },
        { author: 'asc' },
      ];
      break;

    case 'title_desc':
      orderBy = [
        { title: 'desc' },
        { author: 'desc' },
      ];
      break;

    case 'rating_desc':
      orderBy = [
        { rating: 'desc' },
        { title: 'asc' },
      ];
      break;

    case 'rating_asc':
      orderBy = [
        { rating: 'asc' },
        { title: 'asc' },
      ];
      break;

    case 'oldest':
      orderBy = [
        { createdAt: 'asc' },
      ];
      break;

    case 'newest':
    default:
      orderBy = [
        { createdAt: 'desc' },
      ];
      break;
  }

  const items = await prisma.book.findMany({
    where,

    include: {
      genres: {
        include: {
          genre: true,
        },
      },
    },

    orderBy,

    skip,
    take: limit,
  });

  const totalItems = await prisma.book.count({
    where,
  });

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(
        totalItems / limit,
      ),
    },
  };
}

findByTitleAndUserId(
  title: string,
  userId: string,
  excludeId?: string,
) {
  return prisma.book.findFirst({
    where: {
      userId,

      title: {
        equals: title,
        mode: 'insensitive',
      },

      ...(excludeId
        ? {
            id: {
              not: excludeId,
            },
          }
        : {}),
    },
  });
}

  findByIdAndUserId(
    id: string,
    userId: string,
  ) {
    return prisma.book.findFirst({
      where: {
        id,
        userId,
      },

      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });
  }

  async updateById(
    id: string,
    data: UpdateBookDTO,
  ) {
    const {
      genreIds,
      ...bookData
    } = data;

    return prisma.book.update({
      where: {
        id,
      },

      data: {
        ...bookData,

        ...(genreIds
          ? {
              genres: {
                deleteMany: {},

                create: genreIds.map((genreId) => ({
                  genre: {
                    connect: {
                      id: genreId,
                    },
                  },
                })),
              },
            }
          : {}),
      },

      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });
  }

  deleteById(id: string) {
    return prisma.book.delete({
      where: {
        id,
      },
    });
  }
}