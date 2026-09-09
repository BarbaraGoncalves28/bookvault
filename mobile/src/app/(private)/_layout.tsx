import { Redirect, Stack } from 'expo-router';
import {
  View,
  useWindowDimensions,
} from 'react-native';
import { useState } from 'react';

import { Sidebar } from '../../components/layout/sidebar';
import { BottomNavigation } from '../../components/layout/bottom-navigation';
import { useAuth } from '../../hooks/use-auth';

export default function PrivateLayout() {
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  /*
   * =========================================================
   * MOBILE
   * =========================================================
   *
   * No mobile não existe Sidebar.
   * A navegação é feita exclusivamente pelo BottomNavigation.
   */

  if (isMobile) {
    return (
      <View className="flex-1 bg-[#FAF9FC]">
        {/* CONTEÚDO */}

        <View className="min-w-0 flex-1 overflow-hidden">
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </View>

        {/* NAVEGAÇÃO MOBILE */}

        <BottomNavigation />
      </View>
    );
  }

  /*
   * =========================================================
   * WEB / DESKTOP
   * =========================================================
   *
   * Mantém o comportamento atual do Sidebar.
   */

  return (
    <View className="flex-1 flex-row overflow-hidden bg-[#FAF9FC]">
      {/* SIDEBAR */}

      <Sidebar
        isOpen={sidebarOpen}
        onOpen={() =>
          setSidebarOpen(true)
        }
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* CONTEÚDO */}

      <View className="min-w-0 flex-1 overflow-hidden">
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>
    </View>
  );
}