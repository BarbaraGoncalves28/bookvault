import {
  CalendarDays,
  Pencil,
} from 'lucide-react-native';
import {
  Pressable,
  Text,
  View,
} from 'react-native';

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
    <View
      className="
        mx-2
        overflow-hidden
        rounded-[28px]
        border
        border-lavender-200
        bg-white
        shadow-soft
        md:mx-0
      "
    >
      {/* CONTEÚDO PRINCIPAL */}
      <View className="p-5 md:p-6">
        <View
          className="
            flex-col
            items-center
            gap-5
            md:flex-row
            md:items-center
          "
        >
          {/* AVATAR */}
          <View className="relative items-center">
            <ProfileAvatar
              name={name}
              avatarUrl={avatarUrl}
              editable
              onPress={onAvatarPress}
            />
          </View>

          {/* INFORMAÇÕES */}
          <View
            className="
              min-w-0
              w-full
              items-center
              md:flex-1
              md:items-start
              md:w-auto
            "
          >
            <View className="w-full items-center md:items-start">
              <Text
                numberOfLines={1}
                className="
                  max-w-full
                  text-center
                  text-2xl
                  font-bold
                  text-night-900
                  md:text-left
                  md:text-[28px]
                "
              >
                {name || 'Usuário'}
              </Text>
            </View>

            <Text
              numberOfLines={2}
              className="
                mt-1
                max-w-full
                text-center
                text-sm
                text-night-500
                md:text-left
                md:text-base
              "
            >
              {email || 'E-mail não disponível'}
            </Text>

            {/* DATA DE CADASTRO */}
            <View className="mt-4 flex-row items-center">
              <View
                className="
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-brand-50
                "
              >
                <CalendarDays
                  size={16}
                  color="#B100CD"
                  strokeWidth={2}
                />
              </View>

              <View className="ml-2.5">
                <Text
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.8px]
                    text-night-400
                  "
                >
                  Membro desde
                </Text>

                <Text className="mt-0.5 text-xs font-semibold text-night-700">
                  {formattedDate}
                </Text>
              </View>
            </View>
          </View>

          {/* EDITAR PERFIL */}
          <Pressable
            onPress={onEditPress}
            accessibilityRole="button"
            accessibilityLabel="Editar perfil"
            hitSlop={5}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
              transform: [
                {
                  scale: pressed ? 0.98 : 1,
                },
              ],
            })}
            className="
              self-center
              rounded-xl
              border
              border-lavender-200
              bg-white
              px-3.5
              py-2.5
              md:self-center
            "
          >
            <View className="flex-row items-center gap-2">
              <View className="h-7 w-7 items-center justify-center rounded-lg bg-brand-50">
                <Pencil
                  size={14}
                  color="#CA5CDD"
                  strokeWidth={2}
                />
              </View>

              <Text className="text-sm font-bold text-brand-500">
                Editar perfil
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* FAIXA INFERIOR */}
      <View
        className="
          border-t
          border-lavender-100
          bg-lavender-50/50
          px-5
          py-3.5
          md:px-6
        "
      >
        <View className="flex-row items-start md:items-center">
          <View className="mr-2 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500 md:mt-0" />

          <Text className="flex-1 text-xs font-medium text-night-500">
            Seu espaço pessoal para organizar e acompanhar sua jornada de leitura.
          </Text>
        </View>
      </View>
    </View>
  );
}