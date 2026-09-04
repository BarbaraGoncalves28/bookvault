import { Redirect, Stack } from 'expo-router';
import { Pressable, View } from 'react-native';
import {
  PanelLeftOpen,
} from 'lucide-react-native';
import { useState } from 'react';

import { Sidebar } from '../../components/layout/sidebar';
import { useAuth } from '../../hooks/use-auth';

export default function PrivateLayout() {
  const { isAuthenticated } = useAuth();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <View className="flex-1 flex-row overflow-hidden bg-[#FAF9FC]">

      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* CONTEÚDO */}
      <View className="min-w-0 flex-1 overflow-hidden">

        {/* BOTÃO PARA ABRIR NO MOBILE */}
        <Pressable
          onPress={() =>
            setSidebarOpen(true)
          }
          className="absolute left-4 top-4 z-30 h-10 w-10 items-center justify-center rounded-xl bg-[#17152B] md:hidden"
        >
          <PanelLeftOpen
            size={21}
            color="#FFFFFF"
            strokeWidth={2}
          />
        </Pressable>

        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>
    </View>
  );
}