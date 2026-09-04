import type { BookStatus } from '../../../../../generated/prisma/client';

export type CreateBookDTO = {
  title: string;
  author: string;
  genreIds: string[];
  synopsis?: string | null;
  publicationYear?: number | null;
  pages?: number | null;
  coverUrl?: string | null;
  status?: BookStatus;
  favorite?: boolean;
  rating?: number | null;
  review?: string | null;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  currentPage?: number;
};

export type UpdateBookDTO = Partial<CreateBookDTO>;

export type BookSort =
  | 'title_asc'
  | 'title_desc'
  | 'rating_desc'
  | 'rating_asc'
  | 'newest'
  | 'oldest';

export type BookFiltersDTO = {
  status?: BookStatus;
  favorite?: boolean;
  title?: string;
  genreId?: string;
  minRating?: number;
  sort?: BookSort;
  page: number;
};