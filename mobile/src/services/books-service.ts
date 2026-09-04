import type {
  Book,
  BookFilters,
  BookPayload,
  BooksListResponse,
} from '../types/book';

import { apiClient } from './api';

export const booksService = {
  async list(
    filters: BookFilters = {},
  ): Promise<BooksListResponse> {
    const { data } = await apiClient.get<BooksListResponse>(
      '/books',
      {
        params: filters,
      },
    );

    return data;
  },

  async findById(id: string): Promise<Book> {
    const { data } =
      await apiClient.get<Book>(
        `/books/${id}`,
      );

    return data;
  },

  async create(payload: BookPayload): Promise<Book> {
    const { data } =
      await apiClient.post<Book>(
        '/books',
        payload,
      );

    return data;
  },

  async update(
    id: string,
    payload: Partial<BookPayload>,
  ): Promise<Book> {
    const { data } =
      await apiClient.patch<Book>(
        `/books/${id}`,
        payload,
      );

    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/books/${id}`);
  },

  async favorite(id: string): Promise<Book> {
    const { data } =
      await apiClient.patch<Book>(
        `/books/${id}/favorite`,
      );

    return data;
  },

  async unfavorite(id: string): Promise<Book> {
    const { data } =
      await apiClient.patch<Book>(
        `/books/${id}/unfavorite`,
      );

    return data;
  },
};