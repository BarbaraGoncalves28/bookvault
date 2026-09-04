import {
  createContext,
  useEffect,
  useState,
} from 'react';

import type { ReactNode } from 'react';

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../types/auth';

import {
  setAuthToken,
  toApiError,
} from '../services/api';

import { authService } from '../services/auth-service';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    payload: LoginPayload,
  ) => Promise<void>;
  register: (
    payload: RegisterPayload,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (
    user: AuthUser,
  ) => void;
};

export const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

type AuthProviderProps = {
  children: ReactNode;
};

const SECURE_STORE_KEY =
  'bookvault.auth.token';

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [session, setSession] =
    useState<AuthSession | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        let token: string | null = null;

        if (Platform.OS !== 'web') {
          token =
            await SecureStore.getItemAsync(
              SECURE_STORE_KEY,
            );
        }

        if (!token) {
          setSession(null);
          return;
        }

        setAuthToken(token);

        const user =
          await authService.me();

        setSession({
          user,
          token,
        });
      } catch {
        setSession(null);
        setAuthToken(null);

        if (Platform.OS !== 'web') {
          await SecureStore.deleteItemAsync(
            SECURE_STORE_KEY,
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    void restoreSession();
  }, []);

  const updateUser = (
    user: AuthUser,
  ) => {
    setSession((currentSession) => {
      if (!currentSession) {
        return null;
      }

      return {
        ...currentSession,
        user,
      };
    });
  };

  const login = async (
    payload: LoginPayload,
  ): Promise<void> => {
    try {
      const nextSession =
        await authService.login(
          payload,
        );

      if (!nextSession.token) {
        throw new Error(
          'A API não retornou o token de autenticação.',
        );
      }

      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(
          SECURE_STORE_KEY,
          nextSession.token,
        );
      }

      setAuthToken(
        nextSession.token,
      );

      setSession(nextSession);
    } catch (error) {
      throw toApiError(error);
    }
  };

  const register = async (
    payload: RegisterPayload,
  ): Promise<void> => {
    try {
      const nextSession =
        await authService.register(
          payload,
        );

      if (!nextSession.token) {
        throw new Error(
          'A API não retornou o token de autenticação.',
        );
      }

      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(
          SECURE_STORE_KEY,
          nextSession.token,
        );
      }

      setAuthToken(
        nextSession.token,
      );

      setSession(nextSession);
    } catch (error) {
      throw toApiError(error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setSession(null);
      setAuthToken(null);

      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(
          SECURE_STORE_KEY,
        );
      }
    }
  };

  const value: AuthContextValue = {
    user: session?.user ?? null,
    token: session?.token ?? null,
    isAuthenticated:
      Boolean(session?.user),
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
