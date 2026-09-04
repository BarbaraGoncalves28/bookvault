import {
  Pressable,
  Text,
  View,
} from 'react-native';
import {
  BarChart3,
  BookOpen,
  Heart,
  Settings,
  Shield,
} from 'lucide-react-native';
import { router } from 'expo-router';

import { Breadcrumb } from '../../components/layout/breadcrumb';
import { Screen } from '../../components/layout/screen';
import { useProfile } from '../../hooks/use-profile';

import { ProfileGenresCard } from '../../components/profile/profile-genres-card';
import { ProfileHeader } from '../../components/profile/profile-header';
import { ProfileStats } from '../../components/profile/profile-stats';
import { ReadingProgress } from '../../components/profile/reading-progress';
import { ProfileMenuItem } from '../../components/profile/profile-menu-item';
import { BackButton } from '@/components/layout/back-button';

export function ProfileScreen() {
  const {
    profile,
    stats,
    loading,
    statsLoading,
    error,
    refresh,
  } = useProfile();

  if (loading) {
    return (
      <Screen scroll>
        <View className="w-full gap-6 pb-8">
          <View>
            <View className="h-8 w-32 rounded-lg bg-slate-200" />

            <View className="mt-2 h-5 w-64 rounded-lg bg-slate-100" />
          </View>

          <View className="items-center">
            <View className="h-24 w-24 rounded-full bg-slate-200" />

            <View className="mt-4 h-6 w-40 rounded-lg bg-slate-200" />

            <View className="mt-2 h-5 w-52 rounded-lg bg-slate-100" />
          </View>

          <View className="h-44 rounded-2xl bg-slate-100" />

          <View className="h-32 rounded-2xl bg-slate-100" />
        </View>
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen className="min-h-screen">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-lg font-semibold text-ink-950">
            Não foi possível carregar seu perfil.
          </Text>

          <Text className="mt-2 text-center text-sm text-ink-500">
            {error ?? 'Verifique sua conexão e tente novamente.'}
          </Text>

          <Pressable
            onPress={() => void refresh()}
            className="mt-5 h-11 items-center justify-center rounded-xl bg-brand-500 px-6"
          >
            <Text className="font-semibold text-white">
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <>
      <Screen scroll>
        <View className="w-full gap-5 pb-8">

          {/* BREADCRUMB */}
          <View className="mx-3">
            <Breadcrumb current="Meu Perfil" />

            <BackButton />
          </View>

          {/* CARD LARGO DO USUÁRIO */}
          <ProfileHeader
            name={profile.name}
            email={profile.email}
            avatarUrl={profile.avatarUrl}
            createdAt={profile.createdAt}
            onEditPress={() => router.push('/perfil/editar')}
            onAvatarPress={() => router.push('/perfil/editar')}
          />

          {/* CARDS DO PERFIL */}
          {statsLoading ? (
            <View className="mx-3 h-44 rounded-2xl bg-slate-100" />
          ) : stats ? (
            <View className="mx-2 flex-row flex-wrap gap-4">

              {/* CARD 1 — GÊNEROS FAVORITOS */}
              <View className="w-full md:w-[calc(50%-8px)]">
                <ProfileGenresCard
                  genres={stats.genres ?? []}
                  totalBooks={stats.totalBooks}
                />
              </View>

              {/* CARD 2 — ESTATÍSTICAS */}
              <View className="w-full md:w-[calc(50%-8px)]">
                <ProfileStats
  totalBooks={stats.totalBooks}
  completedBooks={stats.completedBooks}
  pagesRead={stats.pagesRead}
  totalPages={stats.totalPages}
  yearlyCompletedBooks={stats.yearlyCompletedBooks}
  annualReadingGoal={stats.annualReadingGoal}
  onReadingGoalUpdated={refresh}
/>
              </View>
            </View>
          ) : null}

        </View>
      </Screen>
    </>
  );
}