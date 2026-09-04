import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../types/auth';

import { apiClient } from './api';

export const authService = {
  async register(
    payload: RegisterPayload,
  ) {
    const { data } =
      await apiClient.post<AuthSession>(
        '/auth/register',
        payload,
      );

    return data;
  },

  async login(
    payload: LoginPayload,
  ) {
    const { data } =
      await apiClient.post<AuthSession>(
        '/auth/login',
        payload,
      );

    return data;
  },

  async me() {
    const { data } =
      await apiClient.get<AuthUser>(
        '/auth/me',
      );

    return data;
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },
};