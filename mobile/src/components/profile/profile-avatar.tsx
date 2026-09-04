import { useMemo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Camera } from 'lucide-react-native';

interface ProfileAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: 'md' | 'lg';
  editable?: boolean;
  onPress?: () => void;
}

export function ProfileAvatar({
  name,
  avatarUrl,
  size = 'lg',
  editable = false,
  onPress,
}: ProfileAvatarProps) {
  const initial = useMemo(() => {
    if (!name?.trim()) {
      return 'U';
    }

    return name.trim().charAt(0).toUpperCase();
  }, [name]);

  const sizeClass =
    size === 'lg'
      ? 'h-24 w-24'
      : 'h-14 w-14';

  const textSize =
    size === 'lg'
      ? 'text-3xl'
      : 'text-lg';

  const content = (
    <View className={`relative ${sizeClass}`}>
      <View className="h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-brand-700 bg-brand-700 shadow-sm">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <Text className={`font-bold text-white ${textSize}`}>
            {initial}
          </Text>
        )}
      </View>

      {editable && (
        <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-500">
          <Camera
            size={15}
            color="#ffffff"
          />
        </View>
      )}
    </View>
  );

  if (!editable) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Alterar foto de perfil"
    >
      {content}
    </Pressable>
  );
}