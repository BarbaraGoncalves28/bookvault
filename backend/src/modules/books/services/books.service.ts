import { AppError } from '../../../shared/errors/app-error';
import { parseOptionalDate } from '../../../shared/utils/parse-date';
import type {
  BookFiltersDTO,
  CreateBookDTO,
  UpdateBookDTO,
} from '../dtos/book.dto';
import { BooksRepository } from '../repositories/books.repository';

export class BooksService {
  constructor(
    private readonly booksRepository = new BooksRepository(),
  ) {}

  async create(
    userId: string,
    data: CreateBookDTO,
  ) {
    const title = data.title.trim();

    const existingBook =
    await this.booksRepository.findByTitleAndUserId(
      title,
      userId,
    );

  if (existingBook) {
    throw new AppError(
      'Você já possui um livro com este título.',
      409,
    );
  }

  const finishedAt =
    data.status === 'COMPLETED'
      ? new Date()
      : null;

    return this.booksRepository.create(userId, {
      ...data,
      title,
      author: data.author.trim(),
      synopsis: data.synopsis?.trim() || null,
      review: data.review?.trim() || null,
      startedAt: data.startedAt,
      finishedAt,
    });
  }

  list(
    userId: string,
    filters: BookFiltersDTO,
  ) {
    return this.booksRepository.findManyByUserId(
      userId,
      filters,
    );
  }

  async findById(
    userId: string,
    id: string,
  ) {
    const book =
      await this.booksRepository.findByIdAndUserId(
        id,
        userId,
      );

    if (!book) {
      throw new AppError('Book not found.', 404);
    }

    return book;
  }

  async update(
  userId: string,
  id: string,
  data: UpdateBookDTO,
) {
  const currentBook = await this.findById(
  userId,
  id,
);

  const updateData: UpdateBookDTO = {
    ...data,
  };

  if (data.status !== undefined) {
  if (
    data.status === 'COMPLETED' &&
    currentBook.status !== 'COMPLETED'
  ) {
    updateData.finishedAt = new Date();
  }

  if (
    data.status !== 'COMPLETED' &&
    currentBook.status === 'COMPLETED'
  ) {
    updateData.finishedAt = null;
  }
}

  if (data.title !== undefined) {
    const title = data.title.trim();

    const existingBook =
      await this.booksRepository.findByTitleAndUserId(
        title,
        userId,
        id,
      );

    if (existingBook) {
      throw new AppError(
        'Você já possui um livro com este título.',
        409,
      );
    }

    updateData.title = title;
  }

  if (data.author !== undefined) {
    updateData.author = data.author.trim();
  }

  if (data.synopsis !== undefined) {
    updateData.synopsis =
      data.synopsis?.trim() || null;
  }

  if (data.review !== undefined) {
    updateData.review =
      data.review?.trim() || null;
  }

  return this.booksRepository.updateById(
    id,
    updateData,
  );
}

  async favorite(
    userId: string,
    id: string,
  ) {
    await this.findById(userId, id);

    return this.booksRepository.updateById(id, {
      favorite: true,
    });
  }

  async unfavorite(
    userId: string,
    id: string,
  ) {
    await this.findById(userId, id);

    return this.booksRepository.updateById(id, {
      favorite: false,
    });
  }

  async delete(
    userId: string,
    id: string,
  ): Promise<void> {
    await this.findById(userId, id);

    await this.booksRepository.deleteById(id);
  }

  parseCreatePayload(
    body: Record<string, unknown>,
  ): CreateBookDTO {
    return {
      title: String(body.title),
      author: String(body.author),

      genreIds: Array.isArray(body.genreIds)
        ? body.genreIds.filter(
            (genreId): genreId is string =>
              typeof genreId === 'string',
          )
        : [],

      synopsis:
        body.synopsis as string | null | undefined,

      publicationYear:
        body.publicationYear as number | null | undefined,

      pages:
        body.pages as number | null | undefined,

      coverUrl:
        body.coverUrl as string | null | undefined,

      status:
        body.status as CreateBookDTO['status'],

      favorite:
        body.favorite as boolean | undefined,

      rating:
        body.rating as number | null | undefined,

      review:
        body.review as string | null | undefined,

      startedAt: parseOptionalDate(
        body.startedAt,
        'startedAt',
      ),

      finishedAt: parseOptionalDate(
        body.finishedAt,
        'finishedAt',
      ),

      currentPage:
        body.currentPage as number | undefined,
    };
  }

  parseUpdatePayload(
    body: Record<string, unknown>,
  ): UpdateBookDTO {
    return {
      title:
        body.title as string | undefined,

      author:
        body.author as string | undefined,

      genreIds: Array.isArray(body.genreIds)
        ? body.genreIds.filter(
            (genreId): genreId is string =>
              typeof genreId === 'string',
          )
        : undefined,

      synopsis:
        body.synopsis as string | null | undefined,

      publicationYear:
        body.publicationYear as number | null | undefined,

      pages:
        body.pages as number | null | undefined,

      coverUrl:
        body.coverUrl as string | null | undefined,

      status:
        body.status as UpdateBookDTO['status'],

      favorite:
        body.favorite as boolean | undefined,

      rating:
        body.rating as number | null | undefined,

      review:
        body.review as string | null | undefined,

      startedAt: parseOptionalDate(
        body.startedAt,
        'startedAt',
      ),

      finishedAt: parseOptionalDate(
        body.finishedAt,
        'finishedAt',
      ),

      currentPage:
        body.currentPage as number | undefined,
    };
  }
}