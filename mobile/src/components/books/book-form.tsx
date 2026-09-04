import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  X,
  ImagePlus,
  ChevronDown,
  Star,
} from 'lucide-react-native';
import { router } from 'expo-router';

import { bookStatusOptions } from '../../constants/book-status';
import { genresService } from '../../services/genres-service';
import { uploadImageToCloudinary } from '../../services/cloudinary-service';
import { toast } from '../../utils/toast';

import type { Genre } from '../../types/genre';
import type {
  Book,
  BookPayload,
  BookStatus,
} from '../../types/book';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { BookFormInput } from '../ui/book-form-input';

type BookFormProps = {
  initialBook?: Book;
  onSubmit: (payload: BookPayload) => Promise<void>;
  submitLabel: string;
};

function capitalizeWords(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function onlyNumbers(value: string) {
  return value.replace(/\D/g, '');
}

function isToReadStatus(status: BookStatus) {
  return status === 'TO_READ';
}

function FormDivider() {
  return (
    <View className="h-px w-full bg-lavender-200" />
  );
}

export function BookForm({
  initialBook,
  onSubmit,
  submitLabel,
}: BookFormProps) {
  const [title, setTitle] = useState(
    initialBook?.title ?? '',
  );

  const [author, setAuthor] = useState(
    initialBook?.author ?? '',
  );

  const [selectedGenreIds, setSelectedGenreIds] =
    useState<string[]>(
      initialBook?.genres.map(
        (genre) => genre.genre.id,
      ) ?? [],
    );

  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] =
    useState(true);

  const [isGenreOpen, setIsGenreOpen] =
    useState(false);

  const [synopsis, setSynopsis] = useState(
    initialBook?.synopsis ?? '',
  );

  const [publicationYear, setPublicationYear] =
    useState(
      initialBook?.publicationYear?.toString() ?? '',
    );

  const [pages, setPages] = useState(
    initialBook?.pages?.toString() ?? '',
  );

  const [status, setStatus] =
    useState<BookStatus>(
      initialBook?.status ?? 'TO_READ',
    );

  const [rating, setRating] = useState<number | null>(
    initialBook?.rating ?? null,
  );

  const [currentPage, setCurrentPage] =
    useState(
      initialBook?.currentPage?.toString() ?? '',
    );

  const [review, setReview] = useState(
    initialBook?.review ?? '',
  );

  const [coverUrl, setCoverUrl] = useState(
    initialBook?.coverUrl ?? '',
  );

  const [isUploadingCover, setIsUploadingCover] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    async function loadGenres() {
      try {
        const data = await genresService.list();

        setGenres(data);
      } catch {
        toast.error(
          'Não foi possível carregar os gêneros.',
        );
      } finally {
        setIsLoadingGenres(false);
      }
    }

    void loadGenres();
  }, []);

  function toggleGenre(genreId: string) {
    setSelectedGenreIds((current) => {
      if (current.includes(genreId)) {
        return current;
      }

      return [...current, genreId];
    });

    setIsGenreOpen(false);
  }

  function removeGenre(genreId: string) {
    setSelectedGenreIds((current) =>
      current.filter((id) => id !== genreId),
    );
  }

  async function handlePickCover() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      toast.error(
        'Permita o acesso às imagens para escolher a capa.',
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.85,
      });

    if (
      result.canceled ||
      !result.assets[0]?.uri
    ) {
      return;
    }

    try {
      setIsUploadingCover(true);

      const url = await uploadImageToCloudinary(
        result.assets[0].uri,
      );

      setCoverUrl(url);

      toast.success(
        'Capa adicionada com sucesso.',
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Não foi possível enviar a capa.',
      );
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function handleSubmit() {
    /*
     * TÍTULO
     */
    if (!title.trim()) {
      toast.error(
        'Informe o título do livro.',
      );
      return;
    }

    /*
     * AUTOR
     */
    if (!author.trim()) {
      toast.error(
        'Informe o autor do livro.',
      );
      return;
    }

    /*
     * GÊNERO
     */
    if (selectedGenreIds.length === 0) {
      toast.error(
        'Selecione pelo menos um gênero.',
      );
      return;
    }

    /*
     * STATUS
     */
    if (!status) {
      toast.error(
        'Selecione o status de leitura.',
      );
      return;
    }

    /*
     * ANO
     */
    if (!publicationYear.trim()) {
      toast.error(
        'Informe o ano de publicação.',
      );
      return;
    }

    const year = Number(publicationYear);

    if (
      !Number.isInteger(year) ||
      year < 1 ||
      year > new Date().getFullYear()
    ) {
      toast.error(
        `O ano de publicação deve estar entre 1 e ${new Date().getFullYear()}.`,
      );
      return;
    }

    /*
     * PÁGINAS
     */
    if (!pages.trim()) {
      toast.error(
        'Informe o número de páginas.',
      );
      return;
    }

    const pageCount = Number(pages);

    if (
      !Number.isInteger(pageCount) ||
      pageCount < 1
    ) {
      toast.error(
        'O número de páginas deve ser maior que zero.',
      );
      return;
    }

    /*
     * CAPA
     */
    if (!coverUrl.trim()) {
      toast.error(
        'Adicione uma capa para continuar.',
      );
      return;
    }

    /*
     * CAMPOS DE LEITURA
     */
    let ratingValue: number | undefined;
    let currentPageValue = 0;
    let reviewValue: string | undefined;

    if (!isToReadStatus(status)) {
      /*
       * NOTA
       */
      if (rating === null) {
        toast.error(
          'Informe uma nota de 1 a 5 estrelas.',
        );
        return;
      }

      if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        toast.error(
          'A nota deve estar entre 1 e 5.',
        );
        return;
      }

      ratingValue = rating;

      /*
       * PÁGINA ATUAL
       */
      if (!currentPage.trim()) {
        toast.error(
          'Informe a página atual.',
        );
        return;
      }

      currentPageValue = Number(currentPage);

      if (
        !Number.isInteger(currentPageValue) ||
        currentPageValue < 0
      ) {
        toast.error(
          'A página atual deve ser um número válido.',
        );
        return;
      }

      if (currentPageValue > pageCount) {
        toast.error(
          'A página atual não pode ser maior que o total de páginas.',
        );
        return;
      }

      /*
       * RESENHA
       */
      reviewValue =
        review.trim() || undefined;
    }

    /*
     * SINOPSE
     */
    if (!synopsis.trim()) {
      toast.error(
        'Informe a sinopse do livro.',
      );
      return;
    }

    /*
     * EVITA DUPLO ENVIO
     */
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
  title: capitalizeWords(title),
  author: capitalizeWords(author),
  genreIds: selectedGenreIds,
  synopsis: capitalizeWords(synopsis),
  publicationYear: year,
  pages: pageCount,
  coverUrl: coverUrl.trim(),
  status,
  rating: ratingValue,
  review: reviewValue
    ? capitalizeWords(reviewValue)
    : undefined,
  currentPage: currentPageValue,
});
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar o livro.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedGenres = genres.filter(
    (genre) =>
      selectedGenreIds.includes(genre.id),
  );

  return (
    <Card className="gap-6 p-5 md:p-7">

      {/* CAPA */}
      <View className="items-center gap-3">
        <Pressable
          onPress={handlePickCover}
          disabled={
            isUploadingCover || isSubmitting
          }
          className="overflow-hidden rounded-2xl border border-lavender-200"
          style={{
            width: 150,
            height: 220,
          }}
        >
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center gap-3 bg-lavender-100">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                <ImagePlus
                  size={26}
                  color="#7057D9"
                />
              </View>

              <Text className="px-5 text-center text-sm font-semibold text-brand-500">
                {isUploadingCover
                  ? 'Enviando...'
                  : 'Adicionar capa'}
              </Text>
            </View>
          )}
        </Pressable>

        {coverUrl ? (
          <Pressable
            onPress={() => setCoverUrl('')}
            disabled={isSubmitting}
          >
            <Text className="text-sm font-semibold text-brand-500">
              Remover capa
            </Text>
          </Pressable>
        ) : null}
      </View>

      <FormDivider />

      {/* TÍTULO + AUTOR */}
      <View className="gap-5 md:flex-row">
        <View className="md:flex-1">
          <BookFormInput
            label="Título"
            value={title}
            onChangeText={setTitle}
            placeholder="Ex.: Harry Potter e a Pedra Filosofal"
          />
        </View>

        <View className="md:flex-1">
          <BookFormInput
            label="Autor"
            value={author}
            onChangeText={setAuthor}
            placeholder="Ex.: 
J. K. Rowling"
          />
        </View>
      </View>

      <FormDivider />

      {/* GÊNERO + STATUS */}
      <View
  className="gap-5 md:flex-row"
  style={{
    position: 'relative',
    zIndex: isGenreOpen ? 1000 : 1,
  }}
>

        {/* GÊNERO */}
        <View
  className="relative gap-2 md:flex-1"
  style={{
    zIndex: isGenreOpen ? 2000 : 1,
  }}
>
          <Text className="text-sm font-bold text-night-900">
            Gêneros:
          </Text>

          {/* SELECT */}
          <Pressable
            onPress={() =>
              setIsGenreOpen(
                (value) => !value,
              )
            }
            className="min-h-12 flex-row items-center justify-between rounded-2xl border bg-white px-4"
            style={{
              borderColor: isGenreOpen
                ? '#7057D9'
                : '#E5E1EE',
            }}
          >
            <Text
              numberOfLines={1}
              className="flex-1 text-base text-night-500"
            >
              Selecione os gêneros
            </Text>

            <ChevronDown
              size={20}
              color="#7057D9"
              strokeWidth={2}
              style={{
                transform: [
                  {
                    rotate: isGenreOpen
                      ? '180deg'
                      : '0deg',
                  },
                ],
              }}
            />
          </Pressable>

          {/* DROPDOWN FLUTUANTE */}
{isGenreOpen ? (
  <View
    className="absolute left-0 right-0 overflow-hidden rounded-2xl border border-lavender-200 bg-white"
    style={{
      top: 76,
      zIndex: 3000,
      backgroundColor: '#FFFFFF',

      shadowColor: '#201E2E',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.16,
      shadowRadius: 16,

      elevation: 30,
    }}
  >
    {isLoadingGenres ? (
      <View className="bg-white px-4 py-4">
        <Text className="text-night-500">
          Carregando gêneros...
        </Text>
      </View>
    ) : genres.length === 0 ? (
      <View className="bg-white px-4 py-4">
        <Text className="text-night-500">
          Nenhum gênero disponível.
        </Text>
      </View>
    ) : (
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator
        className="bg-white"
        style={{
          maxHeight: 220,
          backgroundColor: '#FFFFFF',
        }}
      >
        {genres.map((genre) => {
          const selected =
            selectedGenreIds.includes(genre.id);

          return (
            <Pressable
              key={genre.id}
              onPress={() =>
                toggleGenre(genre.id)
              }
              className={`flex-row items-center justify-between px-4 py-3 ${
                selected
                  ? 'bg-lavender-100'
                  : 'bg-white'
              }`}
            >
              <Text
                className={
                  selected
                    ? 'font-semibold text-brand-500'
                    : 'text-night-900'
                }
              >
                {genre.name}
              </Text>

              {selected ? (
                <View className="h-5 w-5 items-center justify-center rounded-full bg-brand-500">
                  <Text className="text-xs font-bold text-white">
                    ✓
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    )}
  </View>
) : null}

          {/* GÊNEROS SELECIONADOS */}
          {selectedGenres.length > 0 ? (
            <View className="flex-row flex-wrap gap-2 pt-1">
              {selectedGenres.map(
                (genre) => (
                  <View
                    key={genre.id}
                    className="flex-row items-center gap-1 rounded-full border border-brand-300 bg-brand-50 px-3 py-2"
                  >
                    <Text className="text-sm font-semibold text-brand-500">
                      {genre.name}
                    </Text>

                    <Pressable
                      onPress={() =>
                        removeGenre(
                          genre.id,
                        )
                      }
                      hitSlop={8}
                    >
                      <X
                        size={15}
                        color="#7057D9"
                      />
                    </Pressable>
                  </View>
                ),
              )}
            </View>
          ) : null}
        </View>

        {/* STATUS */}
        <View className="gap-3 md:flex-1">
          <Text className="text-sm font-bold text-night-900">
            Status de leitura:
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {bookStatusOptions.map(
              (option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    setStatus(
                      option.value,
                    );

                    if (
                      option.value ===
                      'TO_READ'
                    ) {
                      setRating(null);
                      setCurrentPage(
                        '',
                      );
                      setReview('');
                    }
                  }}
                  className={`rounded-full border px-4 py-2.5 ${
                    status ===
                    option.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-lavender-200 bg-white'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      status ===
                      option.value
                        ? 'text-brand-500'
                        : 'text-night-500'
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ),
            )}
          </View>
        </View>
      </View>

      <FormDivider />

      {/* ANO + PÁGINAS + PÁGINA ATUAL + NOTA */}
      <View className="gap-5 md:flex-row">

        {/* ANO */}
        <View className="md:flex-1">
          <BookFormInput
            label="Ano de publicação"
            value={publicationYear}
            onChangeText={(value) =>
              setPublicationYear(
                onlyNumbers(value),
              )
            }
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={4}
            placeholder="Ex.: 1997"
          />
        </View>

        {/* PÁGINAS */}
        <View className="md:flex-1">
          <BookFormInput
            label="Páginas"
            value={pages}
            onChangeText={(value) =>
              setPages(
                onlyNumbers(value),
              )
            }
            keyboardType="number-pad"
            inputMode="numeric"
            placeholder="Ex.: 264"
          />
        </View>

        {/* PÁGINA ATUAL */}
        {!isToReadStatus(status) ? (
          <View className="md:flex-1">
            <BookFormInput
              label="Página atual"
              value={currentPage}
              onChangeText={(value) =>
                setCurrentPage(
                  onlyNumbers(value),
                )
              }
              keyboardType="number-pad"
              inputMode="numeric"
              placeholder="Ex.: 120"
            />
          </View>
        ) : null}

        {/* NOTA */}
        {!isToReadStatus(status) ? (
          <View className="md:flex-1">
            <Text className="mb-2 text-sm font-bold text-night-900">
              Nota:
            </Text>

            <View className="min-h-12 flex-row items-center gap-2">
              {[1, 2, 3, 4, 5].map(
                (star) => {
                  const selected =
                    rating !== null &&
                    star <= rating;

                  return (
                    <Pressable
                      key={star}
                      onPress={() =>
                        setRating(
                          rating === star
                            ? null
                            : star,
                        )
                      }
                      hitSlop={6}
                    >
                      <Star
                        size={26}
                        color="#FFD700"
                        fill={
                          selected
                            ? '#FFD700'
                            : 'transparent'
                        }
                        strokeWidth={2}
                      />
                    </Pressable>
                  );
                },
              )}

              {rating !== null ? (
                <Text className="ml-1 text-sm font-semibold text-night-500">
                  {rating}/5
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>

      <FormDivider />

      {/* SINOPSE + RESENHA */}
      <View className="gap-5 md:flex-row">

        {/* SINOPSE */}
        <View className="md:flex-1">
          <BookFormInput
            label="Sinopse"
            value={synopsis}
            onChangeText={
              setSynopsis
            }
            multiline
            textAlignVertical="top"
            placeholder="Uma breve descrição do livro..."
            className="min-h-32 py-3"
          />
        </View>

        {/* RESENHA */}
        {!isToReadStatus(status) ? (
          <View className="md:flex-1">
            <BookFormInput
              label="Resenha"
              value={review}
              onChangeText={setReview}
              multiline
              textAlignVertical="top"
              placeholder="Sua opinião, pensamentos e notas sobre a leitura..."
              className="min-h-32 py-3"
            />
          </View>
        ) : null}
      </View>

      <FormDivider />

      {/* AÇÕES */}
      <View className="flex-row items-center justify-end gap-3">
        <Button
          title={submitLabel}
          onPress={handleSubmit}
          isLoading={
            isSubmitting ||
            isUploadingCover
          }
          className="w-auto px-6"
        />

        <Button
          title="Cancelar"
          variant="danger"
          onPress={() =>
            router.replace('/')
          }
          disabled={
            isSubmitting ||
            isUploadingCover
          }
          className="w-auto px-6"
        />
      </View>
    </Card>
  );
}