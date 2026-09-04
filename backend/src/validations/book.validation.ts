import { BookStatus } from '../../../generated/prisma/client';

import { AppError } from '../shared/errors/app-error';
import {
  optionalBoolean,
  optionalDateString,
  optionalInteger,
  optionalString,
  requiredString,
  validateBody,
} from './request.validation';

function requiredGenreIds(value: unknown) {
  if (!Array.isArray(value)) {
    throw new AppError(
      'genreIds must be an array.',
      400,
    );
  }

  if (value.length === 0) {
    throw new AppError(
      'At least one genre is required.',
      400,
    );
  }

  if (
    value.some(
      (genreId) =>
        typeof genreId !== 'string' ||
        !genreId.trim(),
    )
  ) {
    throw new AppError(
      'genreIds must contain valid genre ids.',
      400,
    );
  }
}

function optionalGenreIds(value: unknown) {
  if (value === undefined) {
    return;
  }

  requiredGenreIds(value);
}

function optionalBookStatus(value: unknown) {
  if (value === undefined) {
    return;
  }

  if (
    typeof value !== 'string' ||
    !Object.values(BookStatus).includes(
      value as BookStatus,
    )
  ) {
    throw new AppError(
      'status must be a valid book status.',
      400,
    );
  }
}

export function validateCreateBookBody(body: unknown) {
  validateBody(body, {
    title: requiredString('title', 180),
    author: requiredString('author', 140),

    genreIds: requiredGenreIds,

    synopsis: optionalString('synopsis', 5000),

    publicationYear: optionalInteger(
      'publicationYear',
      {
        min: 0,
        max: 9999,
      },
    ),

    pages: optionalInteger('pages', {
      min: 1,
    }),

    coverUrl: optionalString(
      'coverUrl',
      2000,
    ),

    status: optionalBookStatus,

    favorite: optionalBoolean('favorite'),

    rating: optionalInteger('rating', {
      min: 1,
      max: 5,
    }),

    review: optionalString('review', 5000),

    startedAt: optionalDateString(
      'startedAt',
    ),

    finishedAt: optionalDateString(
      'finishedAt',
    ),

    currentPage: optionalInteger(
      'currentPage',
      {
        min: 0,
      },
    ),
  });
}

export function validateUpdateBookBody(body: unknown) {
  validateBody(body, {
    title: optionalString('title', 180),

    author: optionalString(
      'author',
      140,
    ),

    genreIds: optionalGenreIds,

    synopsis: optionalString(
      'synopsis',
      5000,
    ),

    publicationYear: optionalInteger(
      'publicationYear',
      {
        min: 0,
        max: 9999,
      },
    ),

    pages: optionalInteger('pages', {
      min: 1,
    }),

    coverUrl: optionalString(
      'coverUrl',
      2000,
    ),

    status: optionalBookStatus,

    favorite: optionalBoolean(
      'favorite',
    ),

    rating: optionalInteger('rating', {
      min: 1,
      max: 5,
    }),

    review: optionalString(
      'review',
      5000,
    ),

    startedAt: optionalDateString(
      'startedAt',
    ),

    finishedAt: optionalDateString(
      'finishedAt',
    ),

    currentPage: optionalInteger(
      'currentPage',
      {
        min: 0,
      },
    ),
  });
}