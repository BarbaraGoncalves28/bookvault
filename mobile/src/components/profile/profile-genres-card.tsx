import {
  BookOpen,
  ChevronRight,
  PieChart,
  Trophy,
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
    });

  return (
    <View
      className="
        h-auto
        overflow-hidden
        rounded-[28px]
        border
        border-lavender-200
        bg-white
        p-5
        shadow-soft
        md:h-[405px]
        md:p-6
      "
    >
      {/* CABEÇALHO */}
      <View className="flex-row items-start justify-between">
        <View className="min-w-0 flex-1 pr-4">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
              <PieChart
                size={19}
                color="#B100CD"
                strokeWidth={2}
              />
            </View>

            <View className="min-w-0 flex-1">
              <Text className="text-xl font-bold text-night-900">
                Gêneros favoritos
              </Text>

              <Text
                numberOfLines={1}
                className="mt-0.5 text-sm text-night-500"
              >
                Os gêneros mais presentes na sua biblioteca.
              </Text>
            </View>
          </View>
        </View>

        {topGenres.length > 0 ? (
          <View className="hidden rounded-full bg-lavender-50 px-3 py-1.5 md:flex">
            <Text className="text-xs font-bold text-brand-500">
              Top {topGenres.length}
            </Text>
          </View>
        ) : null}
      </View>

      {/* LISTA */}
      {topGenres.length > 0 ? (
        <ScrollView
          className="mt-6 flex-1"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <View className="gap-4 pr-1">
            {topGenres.map((item, index) => {
              const percentage = Math.min(
  Math.round((item.count / 20) * 100),
  100,
);

              const isFirst = index === 0;

              return (
                <View key={item.genre}>
                  {/* INFORMAÇÕES DO GÊNERO */}
                  <View className="flex-row items-center gap-3">
                    {/* POSIÇÃO */}
                    <View
                      className={`
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        ${
                          isFirst
                            ? 'bg-brand-50'
                            : 'bg-lavender-50'
                        }
                      `}
                    >
                      {isFirst ? (
                        <Trophy
                          size={15}
                          color="#B100CD"
                          strokeWidth={2}
                        />
                      ) : (
                        <Text className="text-[11px] font-bold text-night-400">
                          {String(index + 1).padStart(2, '0')}
                        </Text>
                      )}
                    </View>

                    {/* ÍCONE */}
                    <View className="h-9 w-9 items-center justify-center rounded-xl border border-lavender-200 bg-white">
                      <BookOpen
                        size={16}
                        color="#7057D9"
                        strokeWidth={2}
                      />
                    </View>

                    {/* NOME */}
                    <View className="min-w-0 flex-1">
                      <Text
                        numberOfLines={1}
                        className={`
                          text-sm
                          ${
                            isFirst
                              ? 'font-bold text-night-900'
                              : 'font-semibold text-night-700'
                          }
                        `}
                      >
                        {item.genre}
                      </Text>

                      <Text className="mt-0.5 text-[11px] text-night-400">
                        {item.count === 1
                          ? '1 livro'
                          : `${item.count} livros`}
                      </Text>
                    </View>

                    {/* QUANTIDADE */}
                    <View className="flex-row items-center gap-1">
                      <Text className="text-sm font-bold text-brand-500">
                        {item.count}
                      </Text>

                      <ChevronRight
                        size={13}
                        color="#B9B5C4"
                        strokeWidth={1.8}
                      />
                    </View>
                  </View>

                  {/* BARRA */}
                  <View className="ml-[92px] mt-2 h-1.5 overflow-hidden rounded-full bg-lavender-100">
                    <View
  className="h-full rounded-full bg-brand-500"
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
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-lavender-50">
            <BookOpen
              size={25}
              color="#777486"
              strokeWidth={1.7}
            />
          </View>

          <Text className="mt-4 text-sm font-bold text-night-900">
            Nenhum gênero encontrado
          </Text>

          <Text className="mt-1 max-w-xs text-center text-xs leading-5 text-night-500">
            Cadastre livros para descobrir quais gêneros mais
            combinam com a sua biblioteca.
          </Text>
        </View>
      )}

      {/* RODAPÉ */}
      {totalBooks > 0 ? (
        <View className="mt-4 border-t border-lavender-200 pt-4">
          <Text className="text-xs text-night-500">
            Baseado nos{' '}
            <Text className="font-bold text-night-600">
              {totalBooks}{' '}
              {totalBooks === 1
                ? 'livro'
                : 'livros'}
            </Text>{' '}
            da sua biblioteca.
          </Text>
        </View>
      ) : null}
    </View>
  );
}