import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { LogOut } from 'lucide-react-native';
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
      <Pressable
  onPress={openModal}
  className="flex-row items-center justify-center gap-3 rounded-xl px-4 py-3"
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

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-md rounded-2xl bg-white p-6">
            <View className="items-center">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <LogOut
                  size={26}
                  color="#ff0000"
                />
              </View>

              <Text className="mt-4 text-center text-xl font-bold text-night-900">
                Sair da conta?
              </Text>

              <Text className="mt-2 text-center text-sm leading-5 text-night-500">
                Tem certeza que deseja sair da sua conta?
              </Text>
            </View>

            <View className="mt-6 gap-3">
              <Pressable
                onPress={closeModal}
                disabled={isLoggingOut}
                className="h-12 items-center justify-center rounded-xl bg-night-100"
              >
                <Text className="font-semibold text-night-700">
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={() => void confirmLogout()}
                disabled={isLoggingOut}
                className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-danger"
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <LogOut
                      size={18}
                      color="#ffffff"
                    />

                    <Text className="font-semibold text-white">
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