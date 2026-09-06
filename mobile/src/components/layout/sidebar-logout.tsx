import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { LogOut, ShieldAlert } from 'lucide-react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

import { useAuth } from '../../hooks/use-auth';

export function SidebarLogout() {
  const { logout } = useAuth();

  const [isVisible, setIsVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function openModal() {
    setIsVisible(true);
  }

  function closeModal() {
    if (isLoggingOut) {
      return;
    }

    setIsVisible(false);
  }

  async function confirmLogout() {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);

      await logout();

      setIsVisible(false);

      Toast.show({
        type: 'success',
        text1: 'Sessão encerrada',
        text2: 'Você saiu da sua conta com sucesso!',
        position: 'top',
        visibilityTime: 2500,
      });

      router.replace('/login');
    } catch (error) {
      setIsVisible(false);

      Toast.show({
        type: 'error',
        text1: 'Erro ao sair',
        text2:
          error instanceof Error
            ? error.message
            : 'Não foi possível sair da sua conta.',
        position: 'top',
        visibilityTime: 3500,
      });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      {/* SIDEBAR ACTION */}
      <Pressable
        onPress={openModal}
        accessibilityRole="button"
        accessibilityLabel="Sair da conta"
        className="flex-row items-center justify-center gap-3 rounded-xl px-4 py-3"
        style={({ pressed }) => ({
          opacity: pressed ? 0.72 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <LogOut
          size={20}
          color="#FF0000"
          strokeWidth={2}
        />

        <Text className="text-sm font-semibold text-[#FF0000]">
          Sair da conta
        </Text>
      </Pressable>

      {/* LOGOUT MODAL */}
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 items-center justify-center bg-[#17152B]/75 px-5">
          <View
            className="
              w-full
              max-w-md
              overflow-hidden
              rounded-[28px]
              border
              border-lavender-200
              bg-white
              shadow-2xl
            "
          >
            {/* TOP CONTENT */}
            <View className="items-center px-6 pb-6 pt-7 md:px-7 md:pt-8">
              {/* ICON */}
              <View className="relative">
                <View className="absolute -inset-2 rounded-[24px] bg-red-500/10" />

                <View className="h-16 w-16 items-center justify-center rounded-[22px] border border-red-200 bg-red-50">
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-red-100">
                    <ShieldAlert
                      size={23}
                      color="#FF0000"
                      strokeWidth={2}
                    />
                  </View>
                </View>
              </View>

              {/* TITLE */}
              <Text className="mt-5 text-center text-2xl font-bold tracking-tight text-night-900">
                Sair da conta?
              </Text>

              {/* DESCRIPTION */}
              <Text className="mt-2 max-w-sm text-center text-sm leading-5 text-night-500">
                Tem certeza de que deseja encerrar sua sessão?
              </Text>
            </View>

            {/* DIVIDER */}
            <View className="h-px w-full bg-lavender-100" />

            {/* ACTIONS */}
            <View className="gap-3 px-6 py-5 md:px-7 md:py-6">
              {/* CANCEL */}
              <Pressable
                onPress={closeModal}
                disabled={isLoggingOut}
                accessibilityRole="button"
                accessibilityLabel="Cancelar saída"
                className="
                  h-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-lavender-200
                  bg-white
                "
                style={({ pressed }) => ({
                  opacity: isLoggingOut
                    ? 0.5
                    : pressed
                      ? 0.72
                      : 1,
                  transform: [
                    {
                      scale:
                        pressed && !isLoggingOut
                          ? 0.985
                          : 1,
                    },
                  ],
                })}
              >
                <Text className="text-sm font-bold text-night-700">
                  Cancelar
                </Text>
              </Pressable>

              {/* CONFIRM LOGOUT */}
              <Pressable
                onPress={() => void confirmLogout()}
                disabled={isLoggingOut}
                accessibilityRole="button"
                accessibilityLabel="Sair da conta"
                className="
                  h-12
                  flex-row
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-danger
                "
                style={({ pressed }) => ({
                  opacity: isLoggingOut
                    ? 0.75
                    : pressed
                      ? 0.88
                      : 1,
                  transform: [
                    {
                      scale:
                        pressed && !isLoggingOut
                          ? 0.985
                          : 1,
                    },
                  ],
                })}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <LogOut
                      size={17}
                      color="#FFFFFF"
                      strokeWidth={2.2}
                    />

                    <Text className="text-sm font-bold text-white">
                      Sair da conta
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}