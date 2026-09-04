export type BookStatus =
  | 'TO_READ'
  | 'READING'
  | 'COMPLETED';

export type BookGenre = {
  id: string;
  bookId: string;
  genreId: string;
  genre: {
    id: string;
    name: string;
  };
};

export type Book = {
  id: string;
  title: string;
  author: string;
  genres: BookGenre[];
  synopsis: string | null;
  publicationYear: number | null;
  pages: number | null;
  coverUrl: string | null;
  status: BookStatus;
  favorite: boolean;
  rating: number | null;
  review: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  currentPage: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type BookSort =
  | 'title_asc'
  | 'title_desc'
  | 'rating_desc'
  | 'rating_asc'
  | 'newest'
  | 'oldest';

export type BookFilters = {
  title?: string;
  status?: BookStatus;
  favorite?: boolean;
  genreId?: string;
  minRating?: number;
  sort?: BookSort;
  page?: number;
};

export type BooksPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type BooksListResponse = {
  items: Book[];
  pagination: BooksPagination;
};

export type BookPayload = {
  title: string;
  author: string;
  genreIds: string[];
  synopsis?: string;
  publicationYear?: number;
  pages?: number;
  coverUrl?: string;
  status?: BookStatus;
  favorite?: boolean;
  rating?: number;
  review?: string;
  startedAt?: string;
  finishedAt?: string;
  currentPage?: number;
};