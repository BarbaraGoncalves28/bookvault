import {
  Heart,
  Pencil,
  Trash2,
  Check,
  Hourglass,
  Target,
  Star,
} from 'lucide-react-native';
import { Pressable, Text, View, Image } from 'react-native';

import type { Book } from '../../types/book';
import { BookCardContainer } from './book-card-container';

type BookCardProps = {
  book: Book;
  onPress: () => void;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function BookCard({
  book,
  onPress,
  onToggleFavorite,
  onEdit,
  onDelete,
}: BookCardProps) {
  const isCompleted = book.status === 'COMPLETED';
  const isReading = book.status === 'READING';
  const isToRead = book.status === 'TO_READ';

  const progress =
    isReading && book.pages > 0
      ? Math.min(
          Math.round(
            ((book.currentPage ?? 0) / book.pages) * 100,
          ),
          100,
        )
      : 0;

  return (
    <Pressable
      onPress={onPress}
    >
      <BookCardContainer className="relative gap-3 p-3">

        {/* FAVORITO */}
        <Pressable
          accessibilityRole="button"
          onPress={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2"
          hitSlop={6}
        >
          <Heart
            color="#FF0000"
            fill={book.favorite ? '#FF0000' : 'transparent'}
            size={19}
            strokeWidth={2}
          />
        </Pressable>

        {/* LIVRO */}
        <View className="flex-row gap-3">

          {/* CAPA */}
          <View
            className="overflow-hidden rounded-xl bg-lavender-100"
            style={{
              width: 82,
              height: 120,
            }}
          >
            {book.coverUrl ? (
              <Image
                source={{ uri: book.coverUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center px-2">
                <Text className="text-center text-xs font-semibold text-night-500">
                  Sem capa
                </Text>
              </View>
            )}
          </View>

          {/* INFORMAÇÕES */}
          <View className="min-w-0 flex-1 gap-1">

            {/* TÍTULO */}
            <Text
              numberOfLines={2}
              className="pr-6 text-base font-bold text-night-900"
            >
              {book.title}
            </Text>

            {/* AUTOR */}
            <Text
              numberOfLines={2}
              className="text-xs text-night-500"
            >
              {book.author}
            </Text>

            {/* STATUS */}
            <View className="mt-2 self-start">
              {isCompleted ? (
                <View className="flex-row items-center gap-1 rounded-full border border-brand-500 bg-brand-50 px-2.5 py-1.5">
                  <Text className="text-xs font-bold text-brand-500">
                    Lido
                  </Text>

                  <Check
                    size={13}
                    color='#CA5CDD'
                    strokeWidth={2.5}
                  />
                </View>
              ) : null}

              {isReading ? (
                <View className="flex-row items-center gap-1 rounded-full border border-brand-500 bg-brand-50 px-2.5 py-1.5">
                  <Text className="text-xs font-bold text-brand-500">
                    Lendo
                  </Text>

                  <Hourglass
                    size={13}
                    color='#CA5CDD'
                    strokeWidth={2.5}
                  />
                </View>
              ) : null}

              {isToRead ? (
                <View className="flex-row items-center gap-1 rounded-full border border-brand-500 bg-brand-50 px-2.5 py-1.5">
                  <Text className="text-xs font-bold text-brand-500">
                    Quero ler
                  </Text>

                  <Target
                    size={13}
                    color='#CA5CDD'
                    strokeWidth={2.5}
                  />
                </View>
              ) : null}
            </View>

            {/* ESTRELAS — SOMENTE LIDO */}
            {isCompleted ? (
              <View className="mt-1 flex-row items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled =
                    book.rating !== null &&
                    book.rating !== undefined &&
                    star <= book.rating;

                  return (
                    <Star
                      key={star}
                      size={14}
                      color="#FFD700"
                      fill={filled ? '#FFD700' : 'transparent'}
                      strokeWidth={1.8}
                    />
                  );
                })}
              </View>
            ) : null}

            {/* PROGRESSO — SOMENTE LENDO */}
{isReading ? (
  <View className="mt-1 gap-1">
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <View className="h-1.5 overflow-hidden rounded-full bg-lavender-200">
          <View
            className="h-full rounded-full bg-brand-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </View>
      </View>

      <Text className="ml-2 text-[11px] font-bold text-brand-500">
        {progress}%
      </Text>
    </View>
  </View>
) : null}
          </View>
        </View>

        {/* AÇÕES */}
        <View className="mt-1 flex-row items-center justify-end gap-2 border-t border-lavender-200 pt-2">

          {/* EDITAR */}
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onEdit();
            }}
            className="flex-row items-center gap-1 rounded-lg border border-brand-500 px-3 py-1.5 bg-night-50"
            hitSlop={6} 
          >
            <Pencil
              size={14}
              color='#CA5CDD'
              strokeWidth={2}
            />

            <Text className="text-xs font-semibold text-brand-500">
              Editar
            </Text>
          </Pressable>

          {/* EXCLUIR */}
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="rounded-lg border border-danger p-1.5"
            hitSlop={6}
          >
            <Trash2
              size={16}
              color="#FF0000"
              strokeWidth={2}
            />
          </Pressable>
        </View>
      </BookCardContainer>
    </Pressable>
  );
}