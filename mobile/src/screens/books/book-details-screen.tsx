import { router, useLocalSearchParams } from 'expo-router';
import {
  BookOpen,
  CalendarDays,
  Check,
  Heart,
  Library,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { Breadcrumb } from '../../components/layout/breadcrumb';
import { Screen } from '../../components/layout/screen';
import {
  FeedbackState,
  LoadingState,
} from '../../components/ui/feedback-state';
import { toApiError } from '../../services/api';
import { booksService } from '../../services/books-service';
import type { Book } from '../../types/book';
import { BackButton } from '@/components/layout/back-button';

export function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [isSynopsisExpanded, setIsSynopsisExpanded] =
    useState(false);

  const [isReviewExpanded, setIsReviewExpanded] =
    useState(false);

  const loadBook = useCallback(async () => {
    if (!id) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const bookFromApi = await booksService.findById(id);

      setBook(bookFromApi);
    } catch (error) {
      const apiError = toApiError(error);

      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadBook();
  }, [loadBook]);

  async function toggleFavorite() {
    if (!book) {
      return;
    }

    try {
      const updatedBook = book.favorite
        ? await booksService.unfavorite(book.id)
        : await booksService.favorite(book.id);

      setBook(updatedBook);
    } catch (error) {
      const apiError = toApiError(error);

      Toast.show({
        type: 'error',
        text1: 'Não foi possível atualizar',
        text2: apiError.message,
        position: 'top',
        visibilityTime: 3000,
      });
    }
  }

  function openDeleteModal() {
    setIsDeleteModalVisible(true);
  }

  function closeDeleteModal() {
    if (isDeleting) {
      return;
    }

    setIsDeleteModalVisible(false);
  }

  async function confirmDelete() {
    if (!book || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);

      await booksService.remove(book.id);

      setIsDeleteModalVisible(false);

      Toast.show({
        type: 'success',
        text1: 'Livro excluído',
        text2: 'O livro foi removido da sua biblioteca.',
        position: 'top',
        visibilityTime: 2500,
      });

      router.replace('/home');
    } catch (error) {
      const apiError = toApiError(error);

      setIsDeleteModalVisible(false);

      Toast.show({
        type: 'error',
        text1: 'Não foi possível excluir',
        text2: apiError.message,
        position: 'top',
        visibilityTime: 3500,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <Screen>
        <View className="min-h-screen flex-1 items-center justify-center">
          <LoadingState message="Carregando detalhes do livro..." />
        </View>
      </Screen>
    );
  }

  if (error || !book) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-5">
          <FeedbackState
            title="Livro indisponível"
            message={error ?? 'Livro não encontrado.'}
            actionLabel="Voltar"
            onAction={() => router.back()}
          />
        </View>
      </Screen>
    );
  }

  /*
   * DADOS REAIS VINDOS DO BACKEND
   */

  const totalPages = book.pages ?? 0;

  const currentPage = book.currentPage ?? 0;

  const progress =
    totalPages > 0
      ? Math.min(
          Math.max(
            Math.round((currentPage / totalPages) * 100),
            0,
          ),
          100,
        )
      : 0;

  const rating = book.rating ?? 0;

  const synopsis =
    book.synopsis || 'Sem sinopse cadastrada.';

  const review = book.review || '';

  const synopsisLimit = 300;
  const reviewLimit = 300;

  const isSynopsisLong =
    synopsis.length > synopsisLimit;

  const isReviewLong =
    review.length > reviewLimit;

  const displayedSynopsis =
    isSynopsisExpanded || !isSynopsisLong
      ? synopsis
      : `${synopsis.slice(0, synopsisLimit)}...`;

  const displayedReview =
    isReviewExpanded || !isReviewLong
      ? review
      : `${review.slice(0, reviewLimit)}...`;

  const formattedRating =
    rating > 0 ? rating.toFixed(1).replace('.', ',') : '—';

  const publicationYear =
    book.publicationYear ?? '—';

  

  /*
   * Tenta utilizar o label já existente no projeto.
   * Caso não exista, apresenta uma versão amigável.
   */
  const statusLabels: Record<string, string> = {
    TO_READ: 'Quero ler',
    READING: 'Lendo',
    COMPLETED: 'Lido',
    ABANDONED: 'Abandonado',
  };

  const statusLabel =
    statusLabels[book.status] ?? book.status;

  return (
    <>
      <Screen scroll>
        <View className="mx-auto w-full max-w-6xl">
          {/* BREADCRUMB */}
          <Breadcrumb current="Detalhes do livro" />
          {/* VOLTAR */}
          <BackButton />

          {/* HERO / INFORMAÇÕES PRINCIPAIS */}
          <View
            className="
              overflow-hidden
              rounded-[28px]
              border
              border-lavender-200
              bg-white
              shadow-soft
            "
          >
            <View className="p-5 md:p-8">
              <View className="gap-8 md:flex-row">
                {/* CAPA */}
                <View className="items-center md:w-[280px] md:items-start">
                  <View
                    className="
                      overflow-hidden
                      rounded-[24px]
                      border
                      border-lavender-200
                      bg-lavender-100
                      shadow-soft
                    "
                    style={{
                      width: 230,
                      height: 335,
                    }}
                  >
                    {book.coverUrl ? (
                      <Image
                        source={{
                          uri: book.coverUrl,
                        }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="flex-1 items-center justify-center px-6">
                        <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-white">
                          <Library
                            size={22}
                            color="#B100CD"
                            strokeWidth={1.8}
                          />
                        </View>

                        <Text className="text-center text-sm font-semibold text-night-500">
                          Sem capa cadastrada
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* FAVORITO */}
                  <Pressable
                    onPress={() => void toggleFavorite()}
                    accessibilityRole="button"
                    accessibilityLabel={
                      book.favorite
                        ? 'Remover dos favoritos'
                        : 'Adicionar aos favoritos'
                    }
                    hitSlop={6}
                    className="mt-4 self-center md:self-start"
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.72 : 1,
                      transform: [
                        {
                          scale: pressed ? 0.98 : 1,
                        },
                      ],
                    })}
                  >
                    <View
                      className={`
                        flex-row
                        items-center
                        gap-2.5
                        rounded-full
                        border
                        px-4
                        py-2.5
                        ${
                          book.favorite
                            ? 'border-red-200 bg-red-50'
                            : 'border-lavender-200 bg-white'
                        }
                      `}
                    >
                      <Heart
                        size={17}
                        color={
                          book.favorite
                            ? '#FF0000'
                            : '#777486'
                        }
                        fill={
                          book.favorite
                            ? '#FF0000'
                            : 'transparent'
                        }
                        strokeWidth={2}
                      />

                      <Text
                        className={`
                          text-sm
                          font-semibold
                          ${
                            book.favorite
                              ? 'text-red-600'
                              : 'text-night-600'
                          }
                        `}
                      >
                        {book.favorite
                          ? 'Favoritado'
                          : 'Favoritar'}
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {/* INFORMAÇÕES */}
                <View className="min-w-0 flex-1">
                  {/* STATUS */}
                  <View className="mb-4 self-start">
                    <View className="flex-row items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5">
                      <View className="h-2 w-2 rounded-full bg-brand-500" />

                      <Text className="text-xs font-bold text-brand-500">
                        {statusLabel}
                      </Text>
                    </View>
                  </View>

                  {/* TÍTULO */}
                  <Text
                    className="
                      text-3xl
                      font-bold
                      leading-10
                      text-night-900
                      md:text-5xl
                      md:leading-[56px]
                    "
                  >
                    {book.title}
                  </Text>

                  {/* AUTOR */}
                  <Text className="mt-2 text-lg font-medium text-night-500 md:text-xl">
                    {book.author}
                  </Text>

                  {/* AVALIAÇÃO */}
                  <View className="mt-5 flex-row items-center gap-3">
                    <View className="flex-row items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const filled = star <= rating;

                        return (
                          <Star
                            key={star}
                            size={20}
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

                    <View className="h-5 w-px bg-lavender-200" />

                    <Text className="text-sm font-bold text-night-700">
                      {formattedRating}
                    </Text>

                    <Text className="text-sm text-night-400">
                      / 5
                    </Text>
                  </View>

                  {/* GÊNEROS */}
{book.genres.length > 0 ? (
  <View className="mt-5 flex-row flex-wrap gap-2">
    {book.genres.map((bookGenre) => (
      <View
        key={bookGenre.id}
        className="
          rounded-full
          border
          border-brand-500
          bg-lavender-50
          px-3
          py-1.5
        "
      >
        <Text className="text-xs font-semibold text-brand-500">
          {bookGenre.genre.name}
        </Text>
      </View>
    ))}
  </View>
) : null}

                  {/* MÉTRICAS */}
                  <View className="mt-7 flex-row flex-wrap gap-3">
                    <View className="min-w-[105px] flex-1 rounded-2xl border border-lavender-200 bg-lavender-50 p-4 md:flex-none md:w-[145px]">
                      <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-white">
                        <CalendarDays
                          size={17}
                          color="#B100CD"
                          strokeWidth={2}
                        />
                      </View>

                      <Text className="text-lg font-bold text-night-900">
                        {publicationYear}
                      </Text>

                      <Text className="mt-0.5 text-xs font-medium text-night-500">
                        Ano
                      </Text>
                    </View>

                    <View className="min-w-[105px] flex-1 rounded-2xl border border-lavender-200 bg-lavender-50 p-4 md:flex-none md:w-[145px]">
                      <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-white">
                        <BookOpen
                          size={17}
                          color="#B100CD"
                          strokeWidth={2}
                        />
                      </View>

                      <Text className="text-lg font-bold text-night-900">
                        {totalPages}
                      </Text>

                      <Text className="mt-0.5 text-xs font-medium text-night-500">
                        Páginas
                      </Text>
                    </View>

                    <View className="min-w-[105px] flex-1 rounded-2xl border border-lavender-200 bg-lavender-50 p-4 md:flex-none md:w-[145px]">
                      <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-white">
                        <Check
                          size={18}
                          color="#B100CD"
                          strokeWidth={2.2}
                        />
                      </View>

                      <Text className="text-lg font-bold text-night-900">
                        {currentPage}
                      </Text>

                      <Text className="mt-0.5 text-xs font-medium text-night-500">
                        Páginas lidas
                      </Text>
                    </View>
                  </View>

                  {/* PROGRESSO */}
                  <View
                    className="
                      mt-5
                      rounded-2xl
                      border
                      border-lavender-200
                      bg-night-50
                      p-5
                    "
                  >
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1">
                        <Text className="text-base font-bold text-night-900">
                          Progresso de leitura
                        </Text>

                        <Text className="mt-1 text-sm text-night-500">
                          {currentPage} de {totalPages} páginas lidas
                        </Text>
                      </View>

                      <Text className="text-xl font-bold text-brand-500">
                        {progress}%
                      </Text>
                    </View>

                    <View className="mt-4 h-2.5 overflow-hidden rounded-full bg-lavender-200">
                      <View
                        className="h-full rounded-full bg-brand-500"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* DIVISOR */}
            <View className="h-px w-full bg-lavender-200" />

            {/* CONTEÚDO */}
            <View className="p-5 md:p-8">
              {/* SINOPSE */}
              <View>
                <View className="mb-4 flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                    <BookOpen
                      size={19}
                      color="#B100CD"
                      strokeWidth={2}
                    />
                  </View>

                  <View>
                    <Text className="text-xl font-bold text-night-900">
                      Sinopse
                    </Text>

                    <Text className="mt-0.5 text-sm text-night-500">
                      Sobre esta obra
                    </Text>
                  </View>
                </View>

                <View className="rounded-2xl border border-lavender-200 bg-lavender-50/60 p-5">
                  <Text className="text-base leading-7 text-night-600">
                    {displayedSynopsis}
                  </Text>

                  {isSynopsisLong ? (
                    <Pressable
                      onPress={() =>
                        setIsSynopsisExpanded(
                          (current) => !current,
                        )
                      }
                      accessibilityRole="button"
                      className="mt-4 self-start"
                    >
                      <Text className="text-sm font-bold text-brand-500">
                        {isSynopsisExpanded
                          ? 'Ler menos'
                          : 'Ler mais'}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              {/* RESENHA */}
              {book.review ? (
                <View className="mt-7">
                  <View className="mb-4 flex-row items-center gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                      <Star
                        size={19}
                        color="#B100CD"
                        fill="transparent"
                        strokeWidth={2}
                      />
                    </View>

                    <View>
                      <Text className="text-xl font-bold text-night-900">
                        Resenha
                      </Text>

                      <Text className="mt-0.5 text-sm text-night-500">
                        Sua experiência com a obra
                      </Text>
                    </View>
                  </View>

                  <View className="rounded-2xl border border-lavender-200 bg-lavender-50/60 p-5">
                    <Text className="text-base leading-7 text-night-600">
                      {displayedReview}
                    </Text>

                    {isReviewLong ? (
                      <Pressable
                        onPress={() =>
                          setIsReviewExpanded(
                            (current) => !current,
                          )
                        }
                        accessibilityRole="button"
                        className="mt-4 self-start"
                      >
                        <Text className="text-sm font-bold text-brand-500">
                          {isReviewExpanded
                            ? 'Ler menos'
                            : 'Ler mais'}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {/* AÇÕES */}
              <View className="mt-8 border-t border-lavender-200 pt-6">
                <View className="flex-row flex-wrap items-center justify-end gap-3">
                  {/* EDITAR */}
                  <Pressable
                    onPress={() =>
                      router.push(
                        `/livros/${book.id}/editar`,
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Editar livro"
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.72 : 1,
                      transform: [
                        {
                          scale: pressed ? 0.98 : 1,
                        },
                      ],
                    })}
                    className="
                      h-11
                      flex-row
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-lavender-200
                      bg-white
                      px-5
                    "
                  >
                    <Pencil
                      size={16}
                      color="#B100CD"
                      strokeWidth={2}
                    />

                    <Text className="text-sm font-semibold text-brand-500">
                      Editar livro
                    </Text>
                  </Pressable>

                  {/* EXCLUIR */}
                  <Pressable
                    onPress={openDeleteModal}
                    disabled={isDeleting}
                    accessibilityRole="button"
                    accessibilityLabel="Excluir livro"
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.72 : 1,
                      transform: [
                        {
                          scale: pressed ? 0.98 : 1,
                        },
                      ],
                    })}
                    className="
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-red-200
                      bg-red-50
                    "
                  >
                    <Trash2
                      size={17}
                      color="#FF0000"
                      strokeWidth={2}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Screen>

      {/* MODAL DE EXCLUSÃO */}
<Modal
  visible={isDeleteModalVisible}
  transparent
  animationType="fade"
  onRequestClose={closeDeleteModal}
>
  <View className="flex-1 items-center justify-center bg-[#17152B]/75 px-5">
    <View
      className="
        w-full
        max-w-md
        overflow-hidden
        rounded-[28px]
        border
        border-lavender-200
        bg-white
        shadow-2xl
      "
    >
      {/* CONTEÚDO */}
      <View className="items-center px-6 pb-6 pt-7 md:px-7 md:pt-8">
        {/* ÍCONE */}
        <View className="relative">
          <View className="absolute -inset-2 rounded-[24px] bg-red-500/10" />

          <View className="h-16 w-16 items-center justify-center rounded-[22px] border border-red-200 bg-red-50">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-red-100">
              <Trash2
                size={23}
                color="#FF0000"
                strokeWidth={2}
              />
            </View>
          </View>
        </View>

        {/* TÍTULO */}
        <Text className="mt-5 text-center text-2xl font-bold tracking-tight text-night-900">
          Excluir livro?
        </Text>

        {/* DESCRIÇÃO */}
        <Text className="mt-2 max-w-sm text-center text-sm leading-5 text-night-500">
          Essa ação removerá a obra da sua biblioteca e não
          poderá ser desfeita.
        </Text>

        {/* LIVRO */}
        <View className="mt-5 w-full rounded-2xl border border-lavender-200 bg-lavender-50 p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white">
              <BookOpen
                size={18}
                color="#B100CD"
                strokeWidth={2}
              />
            </View>

            <View className="min-w-0 flex-1">
              <Text
                numberOfLines={2}
                className="text-sm font-bold text-night-900"
              >
                {book.title}
              </Text>

              <Text
                numberOfLines={1}
                className="mt-0.5 text-xs text-night-500"
              >
                {book.author}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* DIVISOR */}
      <View className="h-px w-full bg-lavender-100" />

      {/* AÇÕES */}
      <View className="gap-3 px-6 py-5 md:px-7 md:py-6">
        {/* CANCELAR */}
        <Pressable
          onPress={closeDeleteModal}
          disabled={isDeleting}
          accessibilityRole="button"
          accessibilityLabel="Cancelar exclusão"
          className="
            h-12
            items-center
            justify-center
            rounded-xl
            border
            border-lavender-200
            bg-white
          "
          style={({ pressed }) => ({
            opacity: isDeleting
              ? 0.5
              : pressed
                ? 0.72
                : 1,
            transform: [
              {
                scale:
                  pressed && !isDeleting
                    ? 0.985
                    : 1,
              },
            ],
          })}
        >
          <Text className="text-sm font-bold text-night-700">
            Cancelar
          </Text>
        </Pressable>

        {/* EXCLUIR */}
        <Pressable
          onPress={() => void confirmDelete()}
          disabled={isDeleting}
          accessibilityRole="button"
          accessibilityLabel="Confirmar exclusão"
          className="
            h-12
            flex-row
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-danger
          "
          style={({ pressed }) => ({
            opacity: isDeleting
              ? 0.75
              : pressed
                ? 0.88
                : 1,
            transform: [
              {
                scale:
                  pressed && !isDeleting
                    ? 0.985
                    : 1,
              },
            ],
          })}
        >
          {isDeleting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Trash2
                size={17}
                color="#FFFFFF"
                strokeWidth={2.2}
              />

              <Text className="text-sm font-bold text-white">
                Excluir livro
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  </View>
</Modal>
    </>
  );
}