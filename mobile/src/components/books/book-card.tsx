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
  isReading && (book.pages ?? 0) > 0
    ? Math.min(
        Math.round(
          ((book.currentPage ?? 0) / (book.pages ?? 1)) * 100,
        ),
        100,
      )
    : 0;

  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-95"
    >
      <BookCardContainer
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-[#3A364D]
          bg-[#201E2E]
          p-3
        "
        style={{
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.18,
          shadowRadius: 14,
          elevation: 5,
        }}
      >
        {/* FAVORITO */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            book.favorite
              ? 'Remover livro dos favoritos'
              : 'Adicionar livro aos favoritos'
          }
          onPress={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
          className="
            absolute
            right-5
            top-5
            z-10
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-[#3A364D]
            bg-[#201E2E]
          "
          hitSlop={6}
          style={{
            shadowColor: '#000000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <Heart
            color={book.favorite ? '#FF0000' : '#777486'}
            fill={
              book.favorite
                ? '#FF0000'
                : 'transparent'
            }
            size={17}
            strokeWidth={2}
          />
        </Pressable>

        {/* LIVRO */}
        <View className="flex-row gap-3">

          {/* CAPA */}
          <View
            className="
              overflow-hidden
              rounded-xl
              border
              border-[#3A364D]
              bg-[#F2F0FA]
            "
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
                <View
                  className="
                    mb-2
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#E5E1EE]
                  "
                >
                  <Text className="text-sm font-bold text-[#777486]">
                    BV
                  </Text>
                </View>

                <Text
                  className="
                    text-center
                    text-[10px]
                    font-medium
                    text-[#777486]
                  "
                >
                  Sem capa
                </Text>
              </View>
            )}
          </View>

          {/* INFORMAÇÕES */}
          <View className="min-w-0 flex-1 justify-between py-0.5">

            {/* TÍTULO + AUTOR */}
            <View className="pr-8">
              <Text
                numberOfLines={2}
                className="
                  text-base
                  font-bold
                  leading-5
                  text-[#FAF9FC]
                "
              >
                {book.title}
              </Text>

              <Text
                numberOfLines={2}
                className="
                  mt-1
                  text-xs
                  font-medium
                  leading-4
                  text-[#777486]
                "
              >
                {book.author}
              </Text>
            </View>

            {/* STATUS */}
            <View className="mt-2 self-start">
              {isCompleted ? (
                <View
                  className="
                    flex-row
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-[#CA5CDD]/30
                    bg-[#CA5CDD]/10
                    px-2.5
                    py-1
                  "
                >
                  <Check
                    size={12}
                    color="#CA5CDD"
                    strokeWidth={2.6}
                  />

                  <Text
                    className="
                      text-[11px]
                      font-semibold
                      text-[#CA5CDD]
                    "
                  >
                    Lido
                  </Text>
                </View>
              ) : null}

              {isReading ? (
                <View
                  className="
                    flex-row
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-[#8B73E8]/30
                    bg-[#8B73E8]/10
                    px-2.5
                    py-1
                  "
                >
                  <Hourglass
                    size={12}
                    color="#8B73E8"
                    strokeWidth={2.4}
                  />

                  <Text
                    className="
                      text-[11px]
                      font-semibold
                      text-[#8B73E8]
                    "
                  >
                    Lendo
                  </Text>
                </View>
              ) : null}

              {isToRead ? (
                <View
                  className="
                    flex-row
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-[#E8BCF0]/30
                    bg-[#E8BCF0]/10
                    px-2.5
                    py-1
                  "
                >
                  <Target
                    size={12}
                    color="#E8BCF0"
                    strokeWidth={2.4}
                  />

                  <Text
                    className="
                      text-[11px]
                      font-semibold
                      text-[#E8BCF0]
                    "
                  >
                    Quero ler
                  </Text>
                </View>
              ) : null}
            </View>

            {/* ESTRELAS — SOMENTE LIDO */}
            {isCompleted ? (
              <View className="mt-1.5 flex-row items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled =
                    book.rating !== null &&
                    book.rating !== undefined &&
                    star <= book.rating;

                  return (
                    <Star
                      key={star}
                      size={13}
                      color="#FFD700"
                      fill={
                        filled
                          ? '#FFD700'
                          : 'transparent'
                      }
                      strokeWidth={1.8}
                    />
                  );
                })}
              </View>
            ) : null}

            {/* PROGRESSO — SOMENTE LENDO */}
            {isReading ? (
              <View className="mt-2 gap-1.5">
                <View className="flex-row items-center justify-between">
                  <Text
                    className="
                      text-[10px]
                      font-medium
                      text-[#777486]
                    "
                  >
                    Progresso
                  </Text>

                  <Text
                    className="
                      text-[10px]
                      font-bold
                      text-[#CA5CDD]
                    "
                  >
                    {progress}%
                  </Text>
                </View>

                <View
                  className="
                    h-1.5
                    overflow-hidden
                    rounded-full
                    bg-[#3A364D]
                  "
                >
                  <View
                    className="
                      h-full
                      rounded-full
                      bg-[#CA5CDD]
                    "
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* AÇÕES */}
        <View
          className="
            mt-3
            flex-row
            items-center
            justify-end
            gap-2
            border-t
            pt-3
          "
          style={{
            borderTopColor: '#3A364D',
          }}
        >
          {/* EDITAR */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Editar ${book.title}`}
            onPress={(event) => {
              event.stopPropagation();
              onEdit();
            }}
            className="
              flex-row
              items-center
              gap-1.5
              rounded-lg
              border
              border-[#3A364D]
              bg-[#2A273A]
              px-3
              py-1.5
            "
            hitSlop={6}
          >
            <Pencil
              size={13}
              color="#CA5CDD"
              strokeWidth={2.1}
            />

            <Text
              className="
                text-[11px]
                font-semibold
                text-[#E5E1EE]
              "
            >
              Editar
            </Text>
          </Pressable>

          {/* EXCLUIR */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Excluir ${book.title}`}
            onPress={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              border
              border-[#FF0000]/30
              bg-[#FF0000]/5
            "
            hitSlop={6}
          >
            <Trash2
              size={15}
              color="#FF0000"
              strokeWidth={2}
            />
          </Pressable>
        </View>
      </BookCardContainer>
    </Pressable>
  );
}
