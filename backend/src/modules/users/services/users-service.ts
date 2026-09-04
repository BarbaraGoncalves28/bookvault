import bcrypt from 'bcryptjs';

import { prisma } from '../../../database/prisma';

interface UpdateProfileData {
  name: string;
}

interface UpdateAvatarData {
  avatarUrl: string | null;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileData,
  ) {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: data.name,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateAvatar(
    userId: string,
    data: UpdateAvatarData,
  ) {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarUrl: data.avatarUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getStats(userId: string) {
    const currentYear = new Date().getFullYear();

    const startOfYear = new Date(
      currentYear,
      0,
      1,
    );

    const startOfNextYear = new Date(
      currentYear + 1,
      0,
      1,
    );

  const readingGoal =
  await prisma.readingGoal.upsert({
    where: {
      userId_year: {
        userId,
        year: currentYear,
      },
    },
    update: {},
    create: {
      userId,
      year: currentYear,
      goal: 0,
    },
    select: {
      goal: true,
    },
  });

    const [
      totalBooks,
      completedBooks,
      readingBooks,
      toReadBooks,
      favoriteBooks,
      pagesRead,
      totalPages,
      yearlyCompletedBooks,
      ratingAggregate,
      booksForGenres,
    ] = await Promise.all([
      prisma.book.count({
        where: {
          userId,
        },
      }),

      prisma.book.count({
        where: {
          userId,
          status: 'COMPLETED',
        },
      }),

      prisma.book.count({
        where: {
          userId,
          status: 'READING',
        },
      }),

      prisma.book.count({
        where: {
          userId,
          status: 'TO_READ',
        },
      }),

      prisma.book.count({
        where: {
          userId,
          favorite: true,
        },
      }),

      prisma.book.aggregate({
        where: {
          userId,
        },
        _sum: {
          currentPage: true,
        },
      }),

      prisma.book.aggregate({
        where: {
          userId,
        },
        _sum: {
          pages: true,
        },
      }),

      prisma.book.count({
        where: {
          userId,
          status: 'COMPLETED',
          finishedAt: {
            gte: startOfYear,
            lt: startOfNextYear,
          },
        },
      }),

      prisma.book.aggregate({
        where: {
          userId,
          rating: {
            not: null,
          },
        },
        _avg: {
          rating: true,
        },
      }),

      prisma.book.findMany({
  where: {
    userId,
  },
  select: {
    genres: {
      select: {
        genre: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  },
}),
    ]);

    /*
 * GÊNEROS FAVORITOS
 *
 * Cada livro possui um genreId que aponta
 * diretamente para a tabela genres.
 *
 * Aqui contamos quantos livros do usuário
 * possuem cada gênero.
 */

const genreCount = new Map<
  string,
  {
    name: string;
    count: number;
  }
>();

for (const book of booksForGenres) {
  for (const bookGenre of book.genres) {
    const genreId = bookGenre.genre.id;
    const genreName = bookGenre.genre.name;

    const current = genreCount.get(genreId);

    genreCount.set(genreId, {
      name: genreName,
      count: (current?.count ?? 0) + 1,
    });
  }
}

    /*
     * GÊNEROS FAVORITOS
     *
     * Um gênero só aparece se estiver presente
     * em MAIS DE 3 livros.
     *
     * 1 livro → não aparece
     * 2 livros → não aparece
     * 3 livros → não aparece
     * 4 livros → aparece
     * 5 livros → aparece
     *
     * A porcentagem representa:
     *
     * quantidade de livros que possuem o gênero
     * ÷ quantidade total de livros
     */

    const genreStats = Array.from(
  genreCount.values(),
)
  .filter((genre) => genre.count > 3)
  .sort((genreA, genreB) => {
    return genreB.count - genreA.count;
  }); 

const maxGenreCount =
  genreStats.length > 0
    ? genreStats[0].count
    : 0;

const formattedGenreStats =
  genreStats.map((genre) => ({
    genre: genre.name,

    count: genre.count,

    percentage:
      maxGenreCount > 0
        ? Math.round(
            (genre.count / maxGenreCount) * 100,
          )
        : 0,
  }));

    return {
      totalBooks,

      completedBooks,

      readingBooks,

      toReadBooks,

      favoriteBooks,

      pagesRead:
        pagesRead._sum.currentPage ?? 0,

      totalPages:
        totalPages._sum.pages ?? 0,

      yearlyCompletedBooks,

      annualReadingGoal:
  readingGoal.goal,

      averageRating:
        ratingAggregate._avg.rating ?? 0,

      genres: formattedGenreStats,
    };
  }

    async updateReadingGoal(
    userId: string,
    goal: number,
  ) {
    const currentYear = new Date().getFullYear();

    const readingGoal =
      await prisma.readingGoal.upsert({
        where: {
          userId_year: {
            userId,
            year: currentYear,
          },
        },
        update: {
          goal,
        },
        create: {
          userId,
          year: currentYear,
          goal,
        },
        select: {
          year: true,
          goal: true,
        },
      });

    return readingGoal;
  }

  async changePassword(
    userId: string,
    data: ChangePasswordData,
  ) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const passwordMatches = await bcrypt.compare(
      data.currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      throw new Error(
        'A senha atual está incorreta.',
      );
    }

    const hashedPassword = await bcrypt.hash(
      data.newPassword,
      12,
    );

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  async deleteAccount(userId: string) {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}