import {
  BookOpen,
  PieChart,
} from 'lucide-react-native';
import {
  ScrollView,
  Text,
  View,
} from 'react-native';

import type { UserGenreStat } from '../../types/user';

interface ProfileGenresCardProps {
  genres: UserGenreStat[];
  totalBooks: number;
}

export function ProfileGenresCard({
  genres,
  totalBooks,
}: ProfileGenresCardProps) {
  const topGenres = genres
    .slice()
    .sort((genreA, genreB) => {
      return genreB.count - genreA.count;
    })
    .slice(0, 10);

  const maxGenreCount =
    topGenres.length > 0
      ? topGenres[0].count
      : 0;

  return (
    <View className="h-auto rounded-3xl border border-brand-500 bg-white p-6 md:h-[335px]">
      {/* CABEÇALHO */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-xl font-bold text-night-900">
            Gêneros favoritos
          </Text>

          <Text className="mt-1 text-sm text-night-500">
            Os gêneros mais presentes na sua biblioteca.
          </Text>
        </View>

        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-night-100">
          <PieChart
            size={21}
            color="#CA5CDD"
            strokeWidth={2.2}
          />
        </View>
      </View>

      {topGenres.length > 0 ? (
        <ScrollView
          className="mt-6 flex-1"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <View className="gap-5 pr-2">
            {topGenres.map((item, index) => {
              const percentage =
                maxGenreCount > 0
                  ? Math.round(
                      (item.count / maxGenreCount) * 100,
                    )
                  : 0;

              return (
                <View key={item.genre}>
                  <View className="flex-row items-center gap-3">
                    <Text className="w-7 text-xs font-bold text-night-400">
                      {String(index + 1).padStart(2, '0')}
                    </Text>

                    <View className="h-9 w-9 items-center justify-center rounded-xl bg-night-100">
                      <BookOpen
                        size={16}
                        color="#CA5CDD"
                        strokeWidth={2}
                      />
                    </View>

                    <Text
                      numberOfLines={1}
                      className="flex-1 text-sm font-semibold text-night-700"
                    >
                      {item.genre}
                    </Text>

                    <View className="items-end">
                      <Text className="text-sm font-bold text-brand-700">
                        {item.count}
                      </Text>

                      <Text className="text-[11px] text-night-500">
                        {item.count === 1
                          ? 'livro'
                          : 'livros'}
                      </Text>
                    </View>
                  </View>

                  <View className="ml-10 mt-2 h-2 overflow-hidden rounded-full bg-lavender-100">
                    <View
                      className="h-full rounded-full bg-brand-700"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <BookOpen
            size={32}
            color="#777486"
            strokeWidth={1.7}
          />

          <Text className="mt-3 text-sm font-semibold text-night-900">
            Nenhum gênero encontrado
          </Text>

          <Text className="mt-1 text-center text-xs text-night-500">
            Cadastre livros para descobrir seus gêneros favoritos.
          </Text>
        </View>
      )}

      {/* RODAPÉ */}
      {totalBooks > 0 && (
        <View className="mt-4 border-t border-[#E5E1EE] pt-4">
          <Text className="text-xs text-night-500">
            Baseado nos {totalBooks}{' '}
            {totalBooks === 1
              ? 'livro'
              : 'livros'} da sua biblioteca.
          </Text>
        </View>
      )}
    </View>
  );
}