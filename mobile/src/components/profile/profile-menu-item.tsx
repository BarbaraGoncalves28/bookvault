import { Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

interface ProfileMenuItemProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onPress: () => void;
  danger?: boolean;
}

export function ProfileMenuItem({
  icon: Icon,
  title,
  description,
  onPress,
  danger = false,
}: ProfileMenuItemProps) {
  const iconColor = danger ? '#dc2626' : '#059669';

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-4 active:bg-slate-50"
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        <Icon size={20} color={iconColor} />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className={
            danger
              ? 'font-semibold text-red-600'
              : 'font-semibold text-ink-950'
          }
        >
          {title}
        </Text>

        {description && (
          <Text className="mt-0.5 text-sm text-ink-500">
            {description}
          </Text>
        )}
      </View>

      <ChevronRight size={20} color="#94a3b8" />
    </Pressable>
  );
}