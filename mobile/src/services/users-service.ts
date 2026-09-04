import type {
  ChangePasswordPayload,
  UpdateAvatarPayload,
  UpdateProfilePayload,
  UserProfile,
  UserStats,
} from '../types/user';

import { apiClient } from './api';

export const usersService = {
  async me() {
    const { data } = await apiClient.get<UserProfile>(
      '/users/me',
    );

    return data;
  },

  async updateProfile(
    payload: UpdateProfilePayload,
  ) {
    const { data } = await apiClient.patch<UserProfile>(
      '/users/me',
      payload,
    );

    return data;
  },

  async updateAvatar(
    payload: UpdateAvatarPayload,
  ) {
    const { data } = await apiClient.patch<UserProfile>(
      '/users/me/avatar',
      payload,
    );

    return data;
  },

  async stats() {
    const { data } = await apiClient.get<UserStats>(
      '/users/me/stats',
    );

    return data;
  },

  async updateReadingGoal(goal: number) {
    const { data } = await apiClient.patch(
      '/users/me/reading-goal',
      { goal },
    );

    return data;
  },

  async changePassword(
    payload: ChangePasswordPayload,
  ) {
    await apiClient.patch(
      '/users/me/password',
      payload,
    );
  },

  async deleteAccount() {
    await apiClient.delete('/users/me');
  },
};