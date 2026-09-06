import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import {
  Pressable,
  Text,
  View,
} from 'react-native';

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
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      hitSlop={6}
      className="mb-6 self-start"
      style={({ pressed }) => ({
        opacity: pressed ? 0.72 : 1,
        transform: [
          {
            scale: pressed ? 0.98 : 1,
          },
        ],
      })}
    >
      <View className="flex-row items-center gap-2.5 rounded-full border border-lavender-200 bg-white px-3 py-2">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-50">
          <ArrowLeft
            size={17}
            color="#B100CD"
            strokeWidth={2.2}
          />
        </View>

        <Text className="pr-1 text-sm font-semibold text-night-700">
          Voltar
        </Text>
      </View>
    </Pressable>
  );
}