import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { toApiError } from '../services/api';
import { usersService } from '../services/users-service';

import type {
  UpdateProfilePayload,
  UserProfile,
  UserStats,
} from '../types/user';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setError(null);

      const data = await usersService.me();

      setProfile(data);

      return data;
    } catch (error) {
      const apiError = toApiError(error);

      setError(apiError.message);
      setProfile(null);

      return null;
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await usersService.stats();

      setStats(data);

      return data;
    } catch (error) {
      const apiError = toApiError(error);

      setError(apiError.message);
      setStats(null);

      return null;
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setStatsLoading(true);

    try {
      await Promise.all([
        loadProfile(),
        loadStats(),
      ]);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, [loadProfile, loadStats]);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      const data = await usersService.updateProfile(payload);

      setProfile(data);

      return data;
    },
    [],
  );

  const updateAvatar = useCallback(
    async (avatarUrl: string) => {
      const data = await usersService.updateAvatar({
        avatarUrl,
      });

      setProfile(data);

      return data;
    },
    [],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile]),
  );

  return {
    profile,
    stats,

    loading,
    statsLoading,
    error,

    refresh,
    loadProfile,
    loadStats,

    updateProfile,
    updateAvatar,
  };
}