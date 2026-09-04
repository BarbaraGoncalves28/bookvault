import { apiClient } from './api';
import type { Genre } from '../types/genre';

export const genresService = {
  async list(): Promise<Genre[]> {
    const response = await apiClient.get<Genre[]>('/genres');

    return response.data;
  },
};