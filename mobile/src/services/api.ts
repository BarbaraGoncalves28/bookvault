import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';

import { env } from '../config/env';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Platform': 'native',
  },
});

export function setAuthToken(
  token: string | null,
) {
  if (token) {
    apiClient.defaults.headers.common.Authorization =
      `Bearer ${token}`;

    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
}

export function getAuthConfig(
  token: string,
): AxiosRequestConfig {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export function toApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError =
      error as AxiosError<{
        message?: string;
      }>;

    const statusCode =
      axiosError.response?.status ?? 0;

    const message =
      axiosError.response?.data?.message ??
      axiosError.message ??
      'Não foi possível comunicar com a API.';

    return new ApiError(
      message,
      statusCode,
    );
  }

  if (error instanceof Error) {
    return new ApiError(
      error.message,
      0,
    );
  }

  return new ApiError(
    'Ocorreu um erro inesperado.',
    0,
  );
}
