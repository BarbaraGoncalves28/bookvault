import type { Request, Response } from 'express';
import { BookStatus } from '../../../../generated/prisma/client';

import { AppError } from '../../shared/errors/app-error';
import { BooksService } from '../../modules/books/services/books.service';

export class BooksController {
  constructor(
    private readonly booksService = new BooksService(),
  ) {}

  create = async (
    request: Request,
    response: Response,
  ) => {
    const book = await this.booksService.create(
      request.user!.id,
      this.booksService.parseCreatePayload(
        request.body,
      ),
    );

    return response.status(201).json(book);
  };

  list = async (
    request: Request,
    response: Response,
  ) => {
    const status = this.parseStatusFilter(
      request.query.status,
    );

    const favorite = this.parseFavoriteFilter(
      request.query.favorite,
    );

    const title = this.parseTitleFilter(
      request.query.title,
    );

    const genreId = this.parseGenreIdFilter(
      request.query.genreId,
    );

    const minRating = this.parseMinRatingFilter(
      request.query.minRating,
    );

    const sort = this.parseSortFilter(
      request.query.sort,
    );

    const page = this.parsePageFilter(
      request.query.page,
    );

    const result = await this.booksService.list(
      request.user!.id,
      {
        status,
        favorite,
        title,
        genreId,
        minRating,
        sort,
        page,
      },
    );

    return response.status(200).json(result);
  };

  show = async (
    request: Request,
    response: Response,
  ) => {
    const book =
      await this.booksService.findById(
        request.user!.id,
        this.getBookId(request),
      );

    return response.status(200).json(book);
  };

  update = async (
    request: Request,
    response: Response,
  ) => {
    const book =
      await this.booksService.update(
        request.user!.id,
        this.getBookId(request),
        this.booksService.parseUpdatePayload(
          request.body,
        ),
      );

    return response.status(200).json(book);
  };

  delete = async (
    request: Request,
    response: Response,
  ) => {
    await this.booksService.delete(
      request.user!.id,
      this.getBookId(request),
    );

    return response.status(204).send();
  };

  favorite = async (
    request: Request,
    response: Response,
  ) => {
    const book =
      await this.booksService.favorite(
        request.user!.id,
        this.getBookId(request),
      );

    return response.status(200).json(book);
  };

  unfavorite = async (
    request: Request,
    response: Response,
  ) => {
    const book =
      await this.booksService.unfavorite(
        request.user!.id,
        this.getBookId(request),
      );

    return response.status(200).json(book);
  };

  private getBookId(request: Request) {
    const { id } = request.params;

    if (typeof id !== 'string') {
      throw new AppError(
        'Book id is required.',
        400,
      );
    }

    return id;
  }

  private parseStatusFilter(value: unknown) {
    if (value === undefined) {
      return undefined;
    }

    if (
      typeof value !== 'string' ||
      !Object.values(BookStatus).includes(
        value as BookStatus,
      )
    ) {
      throw new AppError(
        'status query parameter is invalid.',
        400,
      );
    }

    return value as BookStatus;
  }

  private parseFavoriteFilter(value: unknown) {
    if (value === undefined) {
      return undefined;
    }

    if (
      value !== 'true' &&
      value !== 'false'
    ) {
      throw new AppError(
        'favorite query parameter must be true or false.',
        400,
      );
    }

    return value === 'true';
  }

  private parseTitleFilter(value: unknown) {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw new AppError(
        'title query parameter must be a string.',
        400,
      );
    }

    return value.trim() || undefined;
  }

  private parseGenreIdFilter(value: unknown) {
    if (value === undefined) {
      return undefined;
    }

    if (
      typeof value !== 'string' ||
      !value.trim()
    ) {
      throw new AppError(
        'genreId query parameter is invalid.',
        400,
      );
    }

    return value.trim();
  }

  private parseMinRatingFilter(value: unknown) {
    if (value === undefined) {
      return undefined;
    }

    const rating = Number(value);

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      throw new AppError(
        'minRating query parameter must be an integer between 1 and 5.',
        400,
      );
    }

    return rating;
  }

  private parseSortFilter(value: unknown) {
    if (value === undefined) {
      return 'newest' as const;
    }

    const validSorts = [
      'title_asc',
      'title_desc',
      'rating_desc',
      'rating_asc',
      'newest',
      'oldest',
    ] as const;

    if (
      typeof value !== 'string' ||
      !validSorts.includes(
        value as (typeof validSorts)[number],
      )
    ) {
      throw new AppError(
        'sort query parameter is invalid.',
        400,
      );
    }

    return value as (typeof validSorts)[number];
  }

  private parsePageFilter(value: unknown) {
    if (value === undefined) {
      return 1;
    }

    const page = Number(value);

    if (
      !Number.isInteger(page) ||
      page < 1
    ) {
      throw new AppError(
        'page query parameter must be a positive integer.',
        400,
      );
    }

    return page;
  }
}