import { Pressable, Text } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export function BackButton() {
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/home');
  }

  return (
    <Pressable
      onPress={handleBack}
      className="
        mb-6
        h-11
        flex-row
        items-center
        self-start
        gap-2
        rounded-xl
        border
        border-brand-500
        bg-night-50
        px-4
        shadow-soft
      "
    >
      <ArrowLeft
        size={18}
        color='#CA5CDD'
        strokeWidth={2.2}
      />

      <Text className="text-sm font-semibold text-brand-500">
        Voltar
      </Text>
    </Pressable>
  );
}