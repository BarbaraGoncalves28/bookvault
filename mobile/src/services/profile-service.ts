import type { AuthUser } from '../types/auth';
import { apiClient } from './api';

export type UpdateProfilePayload = {
  name?: string;
  avatarUrl?: string | null;
};

export const profileService = {
  async getProfile() {
    const { data } = await apiClient.get<AuthUser>('/profile');

    return data;
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const { data } = await apiClient.patch<AuthUser>('/profile', payload);

    return data;
  },
};