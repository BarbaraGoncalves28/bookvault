import { Pressable, Text, View } from 'react-native';
import { CalendarDays, Pencil } from 'lucide-react-native';

import { ProfileAvatar } from './profile-avatar';

interface ProfileHeaderProps {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  onEditPress: () => void;
  onAvatarPress: () => void;
}

export function ProfileHeader({
  name,
  email,
  avatarUrl,
  createdAt,
  onEditPress,
  onAvatarPress,
}: ProfileHeaderProps) {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Data não disponível';

  return (
    <View className="mx-2 rounded-3xl border border-brand-500 bg-white p-6">
      <View className="flex-row items-center">
        {/* AVATAR */}
        <ProfileAvatar
          name={name}
          avatarUrl={avatarUrl}
          editable
          onPress={onAvatarPress}
        />

        {/* INFORMAÇÕES */}
        <View className="ml-4 flex-1">
          <Text
            numberOfLines={1}
            className="text-xl font-bold text-[#201E2E]"
          >
            {name || 'Usuário'}
          </Text>

          <Text
            numberOfLines={1}
            className="mt-1 text-sm text-[#777486]"
          >
            {email || 'E-mail não disponível'}
          </Text>

          {/* DATA DE CADASTRO */}
          <View className="mt-3 flex-row items-center">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-night-100">
              <CalendarDays
                size={14}
                color="#CA5CDD"
                strokeWidth={2.2}
              />
            </View>

            <View className="ml-2">
              <Text className="text-[10px] font-medium uppercase tracking-wide text-night-500">
                Membro desde
              </Text>

              <Text className="text-xs font-semibold text-night-900">
                {formattedDate}
              </Text>
            </View>
          </View>
        </View>

        {/* EDITAR PERFIL */}
        <Pressable
          onPress={onEditPress}
          className="ml-3 h-10 flex-row items-center justify-center rounded-xl border bg-night-50 px-3 border-brand-500"
        >
          <Pencil
            size={15}
            color="#CA5CDD"
            strokeWidth={2.2}
          />

          <Text className="ml-2 text-sm font-semibold text-brand-500">
            Editar perfil
          </Text>
        </Pressable>
      </View>
    </View>
  );
}