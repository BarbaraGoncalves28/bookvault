import { router, useLocalSearchParams } from 'expo-router';
import {
  Heart,
  Pencil,
  Trash2,
  Star,
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
import { FeedbackState, LoadingState } from '../../components/ui/feedback-state';
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
      const bookFromApi =
        await booksService.findById(id);

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
        text1: 'Erro',
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
        text2:
          'O livro foi removido da sua biblioteca.',
        position: 'top',
        visibilityTime: 2500,
      });

      router.replace('/home');
    } catch (error) {
      const apiError = toApiError(error);

      setIsDeleteModalVisible(false);

      Toast.show({
        type: 'error',
        text1: 'Erro ao excluir livro',
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
        <View className="flex-1 items-center justify-center">
          <FeedbackState
            title="Livro indisponível"
            message={
              error ?? 'Livro não encontrado.'
            }
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

  const currentPage =
    book.currentPage ?? 0;

  const progress =
    totalPages > 0
      ? Math.min(
          Math.max(
            Math.round(
              (currentPage / totalPages) * 100,
            ),
            0,
          ),
          100,
        )
      : 0;

  const rating =
    book.rating ?? 0;

    const synopsis = book.synopsis || 'Sem sinopse cadastrada.';
const review = book.review || '';

const synopsisLimit = 300;
const reviewLimit = 300;

const isSynopsisLong = synopsis.length > synopsisLimit;
const isReviewLong = review.length > reviewLimit;

const displayedSynopsis =
  isSynopsisExpanded || !isSynopsisLong
    ? synopsis
    : `${synopsis.slice(0, synopsisLimit)}...`;

const displayedReview =
  isReviewExpanded || !isReviewLong
    ? review
    : `${review.slice(0, reviewLimit)}...`;

  return (
    <>
      <Screen scroll>
        <View className="mx-auto w-full max-w-5xl">

          {/* BREADCRUMB */}
          <Breadcrumb current="Detalhes do livro" />

          <BackButton />

          {/* CARD PRINCIPAL */}
          <View
            className="
              rounded-[28px]
              border
              border-brand-500
              bg-white
              p-5
              shadow-soft
              md:p-8
            "
          >
            {/* CAPA + INFORMAÇÕES */}
            <View className="gap-7 md:flex-row">

              {/* CAPA */}
              <View className="items-center md:w-[280px] md:items-start">
                <View
                  className="
                    overflow-hidden
                    rounded-2xl
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
                      <Text className="text-center text-sm font-semibold text-night-500">
                        Sem capa cadastrada
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* INFORMAÇÕES */}
              <View className="min-w-0 flex-1 gap-5">

                {/* TÍTULO + AUTOR */}
                <View className="gap-2">
                  <Text
                    className="
                      text-3xl
                      font-bold
                      leading-9
                      text-night-900
                      md:text-4xl
                    "
                  >
                    {book.title}
                  </Text>

                  <Text className="text-lg text-night-500">
                    {book.author}
                  </Text>
                </View>

                {/* ESTRELAS */}
                <View className="flex-row items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled =
                      star <= rating;

                    return (
                      <Star
                        key={star}
                        size={22}
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

                {/* PROGRESSO */}
                <View
                  className="
                    gap-4
                    rounded-2xl
                    border
                    border-night-100
                    bg-night-50
                    p-5
                  "
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-night-900">
                      Progresso de leitura
                    </Text>
                  </View>

                  {/* BARRA + PORCENTAGEM */}
                  <View className="flex-row items-center gap-3">
                    <View className="h-3 flex-1 overflow-hidden rounded-full bg-lavender-200">
                      <View
                        className="h-full rounded-full bg-brand-500"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </View>

                    <Text className="w-12 text-right text-sm font-bold text-brand-500">
                      {progress}%
                    </Text>
                  </View>

                  {/* PÁGINAS */}
                  <Text className="text-sm font-medium text-night-500 text-end">
                    Lidas {currentPage} páginas de {totalPages} páginas
                  </Text>
                </View>

              </View>
            </View>

            {/* SINOPSE */}
<View className="mt-8 gap-2">
  <Text className="text-xl font-bold text-night-900">
    Sinopse
  </Text>

  <Text className="text-base leading-7 text-night-500">
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
    >
      <Text className="font-semibold text-brand-500">
        {isSynopsisExpanded
          ? 'Ler menos'
          : 'Ler mais'}
      </Text>
    </Pressable>
  ) : null}
</View>

            {/* RESENHA */}
{book.review ? (
  <View className="mt-7 gap-2">
    <Text className="text-xl font-bold text-night-900">
      Resenha
    </Text>

    <Text className="text-base leading-7 text-night-500">
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
      >
        <Text className="font-semibold text-brand-500">
          {isReviewExpanded
            ? 'Ler menos'
            : 'Ler mais'}
        </Text>
      </Pressable>
    ) : null}
  </View>
) : null}

            {/* AÇÕES */}
            <View
              className="
                mt-8
                flex-row
                items-center
                justify-end
                gap-3
                border-t
                border-lavender-200
                pt-6
              "
            >
              {/* FAVORITAR */}
              <Pressable
                onPress={() =>
                  void toggleFavorite()
                }
                accessibilityRole="button"
                className="
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-lavender-200
                  bg-white
                "
              >
                <Heart
                  size={20}
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
              </Pressable>

              {/* EDITAR */}
              <Pressable
                onPress={() =>
                  router.push(
                    `/livros/${book.id}/editar`,
                  )
                }
                accessibilityRole="button"
                className="
                  h-11
                  flex-row
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-brand-500
                  bg-night-50
                  px-4
                "
              >
                <Pencil
                  size={17}
                  color='#CA5CDD'
                  strokeWidth={2}
                />

                <Text className="font-semibold text-brand-500">
                  Editar
                </Text>
              </Pressable>

              {/* EXCLUIR */}
              <Pressable
                onPress={openDeleteModal}
                disabled={isDeleting}
                accessibilityRole="button"
                className="
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-danger
                "
              >
                <Trash2
                  size={18}
                  color="#FF0000"
                  strokeWidth={2}
                />
              </Pressable>
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
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-md rounded-2xl bg-white p-6">

            <View className="items-center">

              <View className="h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <Trash2
                  size={26}
                  color="#ff0000"
                />
              </View>

              <Text className="mt-4 text-center text-xl font-bold text-night-900"> 
                Excluir livro?
              </Text>

              <Text className="mt-2 text-center text-sm leading-5 text-night-500">
                Tem certeza que deseja excluir{' '} 
                <Text className="font-semibold text-[#201E2E]">
                  "{book.title}"
                </Text>{' '}
                da sua biblioteca? 
              </Text>
            </View>

            <View className="mt-6 gap-3">

              {/* CANCELAR */}
              <Pressable
                onPress={closeDeleteModal}
                disabled={isDeleting}
                className="
                  h-12 items-center justify-center rounded-xl bg-night-100
                "
              >
                <Text className="font-semibold text-night-700">
                  Cancelar
                </Text>
              </Pressable>

              {/* EXCLUIR */}
              <Pressable
                onPress={() =>
                  void confirmDelete()
                }
                disabled={isDeleting}
                className="
                  h-12 flex-row items-center justify-center gap-2 rounded-xl bg-danger
                "
              >
                {isDeleting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Trash2
                      size={18}
                      color="#ffffff"
                    />

                    <Text className="font-semibold text-white">
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