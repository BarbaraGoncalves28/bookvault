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
  BookOpen,
  Library,
  Check,
  FileText,
  BookMarked,
  Info,
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

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BookOpen;
  title: string;
  description?: string;
}) {
  return (
    <View className="mb-5 flex-row items-start gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
        <Icon
          size={19}
          color="#B100CD"
          strokeWidth={2}
        />
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-night-900">
          {title}
        </Text>

        {description ? (
          <Text className="mt-0.5 text-sm text-night-500">
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
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
    if (!title.trim()) {
      toast.error(
        'Informe o título do livro.',
      );
      return;
    }

    if (!author.trim()) {
      toast.error(
        'Informe o autor do livro.',
      );
      return;
    }

    if (selectedGenreIds.length === 0) {
      toast.error(
        'Selecione pelo menos um gênero.',
      );
      return;
    }

    if (!status) {
      toast.error(
        'Selecione o status de leitura.',
      );
      return;
    }

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

    if (!coverUrl.trim()) {
      toast.error(
        'Adicione uma capa para continuar.',
      );
      return;
    }

    let ratingValue: number | undefined;
    let currentPageValue = 0;
    let reviewValue: string | undefined;

    if (!isToReadStatus(status)) {
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

      reviewValue =
        review.trim() || undefined;
    }

    if (!synopsis.trim()) {
      toast.error(
        'Informe a sinopse do livro.',
      );
      return;
    }

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
    <View className="w-full gap-5">
      {/* CABEÇALHO */}

      {/* FORMULÁRIO */}
      <Card className="overflow-visible gap-0 p-0">
        {/* CAPA + IDENTIFICAÇÃO */}
        <View
  className="relative p-5 md:p-8"
  style={{
    zIndex: isGenreOpen ? 9999 : 1,
  }}
>
          <SectionHeader
            icon={BookOpen}
            title="Identificação do livro"
            description="Comece adicionando a capa e as informações principais da obra."
          />

          <View className="gap-7 md:flex-row md:items-start">
            {/* CAPA */}
            <View className="items-center md:w-[190px]">
              <Pressable
                onPress={handlePickCover}
                disabled={
                  isUploadingCover ||
                  isSubmitting
                }
                accessibilityRole="button"
                accessibilityLabel="Adicionar capa do livro"
                className="overflow-hidden rounded-[22px] border-2 border-lavender-200 bg-lavender-100"
                style={{
                  width: 160,
                  height: 235,
                  shadowColor: '#201E2E',
                  shadowOffset: {
                    width: 0,
                    height: 6,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                {coverUrl ? (
                  <>
                    <Image
                      source={{ uri: coverUrl }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />

                    <View className="absolute inset-x-0 bottom-0 bg-[#17152B]/75 px-3 py-3">
                      <View className="flex-row items-center justify-center gap-2">
                        <ImagePlus
                          size={15}
                          color="#FFFFFF"
                        />

                        <Text className="text-xs font-semibold text-white">
                          Alterar capa
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <View className="flex-1 items-center justify-center gap-4 px-5">
                    <View className="h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
                      <ImagePlus
                        size={28}
                        color="#B100CD"
                        strokeWidth={1.8}
                      />
                    </View>

                    <View className="items-center">
                      <Text className="text-sm font-bold text-night-900">
                        {isUploadingCover
                          ? 'Enviando capa...'
                          : 'Adicionar capa'}
                      </Text>

                      <Text className="mt-1 text-center text-xs leading-5 text-night-500">
                        JPG, PNG ou WEBP
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>

              {coverUrl ? (
                <Pressable
                  onPress={() => setCoverUrl('')}
                  disabled={isSubmitting}
                  className="mt-3 rounded-full px-3 py-1.5"
                  hitSlop={8}
                >
                  <Text className="text-xs font-semibold text-brand-500">
                    Remover capa
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {/* TÍTULO + AUTOR */}
            <View className="flex-1 gap-5">
              <BookFormInput
                label="Título"
                value={title}
                onChangeText={setTitle}
                placeholder="Ex.: Harry Potter e a Pedra Filosofal"
              />

              <BookFormInput
                label="Autor"
                value={author}
                onChangeText={setAuthor}
                placeholder="Ex.: J. K. Rowling"
              />
            </View>
          </View>
        </View>

        <FormDivider />

        {/* GÊNEROS + STATUS */}
        <View
  className="relative p-5 md:p-8"
  style={{
    zIndex: isGenreOpen ? 100 : 1,
  }}
>
          <SectionHeader
            icon={BookMarked}
            title="Classificação e leitura"
            description="Defina os gêneros e acompanhe em que momento da leitura você está."
          />

          <View
            className="gap-7 md:flex-row"
            style={{
              position: 'relative',
              zIndex: isGenreOpen ? 1000 : 1,
            }}
          >
            {/* GÊNEROS */}
            <View
              className="relative gap-2 md:flex-1"
              style={{
                zIndex: isGenreOpen ? 9999 : 1,
              }}
            >
              <Text className="text-sm font-bold text-night-900">
                Gêneros
              </Text>

              <Pressable
                onPress={() =>
                  setIsGenreOpen(
                    (value) => !value,
                  )
                }
                disabled={isLoadingGenres}
                accessibilityRole="button"
                accessibilityLabel="Selecionar gêneros"
                className="h-14 flex-row items-center justify-between rounded-2xl border bg-white px-4"
                style={{
                  borderColor: isGenreOpen
                    ? '#7057D9'
                    : '#E5E1EE',
                  shadowColor: isGenreOpen
                    ? '#7057D9'
                    : '#201E2E',
                  shadowOffset: {
                    width: 0,
                    height: isGenreOpen ? 3 : 1,
                  },
                  shadowOpacity: isGenreOpen
                    ? 0.1
                    : 0.03,
                  shadowRadius: 6,
                  elevation: isGenreOpen ? 3 : 1,
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
                  color='#CA5CDD'
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

              {/* DROPDOWN */}
              {isGenreOpen ? (
                <View
  className="absolute left-0 right-0 overflow-hidden rounded-2xl border border-lavender-200"
  style={{
    top: 76,
    zIndex: 99999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#201E2E',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 30,
  }}
>
                  <View className="border-b border-lavender-200 bg-lavender-100 px-4 py-3">
                    <Text className="text-xs font-bold uppercase tracking-wider text-night-500">
                      Selecionar gêneros
                    </Text>
                  </View>

                  {isLoadingGenres ? (
                    <View className="bg-white px-4 py-5">
                      <Text className="text-sm text-night-500">
                        Carregando gêneros...
                      </Text>
                    </View>
                  ) : genres.length === 0 ? (
                    <View className="bg-white px-4 py-5">
                      <Text className="text-sm text-night-500">
                        Nenhum gênero disponível.
                      </Text>
                    </View>
                  ) : (
                    <ScrollView
                      nestedScrollEnabled
                      showsVerticalScrollIndicator
                      className="bg-white"
                      style={{
                        maxHeight: 250,
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      {genres.map((genre) => {
                        const selected =
                          selectedGenreIds.includes(
                            genre.id,
                          );

                        return (
                          <Pressable
                            key={genre.id}
                            onPress={() =>
                              toggleGenre(
                                genre.id,
                              )
                            }
                            className={`flex-row items-center justify-between px-4 py-3.5 ${
                              selected
                                ? 'bg-brand-50'
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
                                <Check
                                  size={12}
                                  color="#FFFFFF"
                                  strokeWidth={3}
                                />
                              </View>
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
              ) : null}

              {/* CHIPS */}
              {selectedGenres.length > 0 ? (
                <View className="flex-row flex-wrap gap-2 pt-1">
                  {selectedGenres.map(
                    (genre) => (
                      <View
                        key={genre.id}
                        className="flex-row items-center gap-1.5 rounded-full border border-brand-500 bg-brand-50 px-3 py-2"
                      >
                        <Text className="text-xs font-bold text-brand-500">
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
                            size={14}
                            color="#CA5CDD"
                            strokeWidth={2.5}
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
                Status de leitura
              </Text>

              <View className="gap-2">
                {bookStatusOptions.map(
                  (option) => {
                    const selected =
                      status ===
                      option.value;

                    return (
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
                        className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
                          selected
                            ? 'border-brand-300 bg-brand-50'
                            : 'border-lavender-200 bg-white'
                        }`}
                      >
                        <View className="flex-row items-center gap-3">
                          <View
                            className={`h-2.5 w-2.5 rounded-full ${
                              selected
                                ? 'bg-brand-500'
                                : 'bg-lavender-200'
                            }`}
                          />

                          <Text
                            className={`text-sm font-semibold ${
                              selected
                                ? 'text-brand-500'
                                : 'text-night-500'
                            }`}
                          >
                            {option.label}
                          </Text>
                        </View>

                        {selected ? (
                          <View className="h-5 w-5 items-center justify-center rounded-full bg-brand-500">
                            <Check
                              size={12}
                              color="#FFFFFF"
                              strokeWidth={3}
                            />
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  },
                )}
              </View>
            </View>
          </View>
        </View>

        <FormDivider />

        {/* DETALHES */}
        <View className="p-5 md:p-8">
          <SectionHeader
            icon={FileText}
            title="Detalhes da obra"
            description="Informações editoriais e métricas da leitura."
          />

          <View className="gap-5 md:flex-row">
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
          </View>

          {/* NOTA */}
          {!isToReadStatus(status) ? (
            <View className="mt-6">
              <Text className="mb-3 text-sm font-bold text-night-900">
                Sua avaliação
              </Text>

              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
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
                          accessibilityRole="button"
                          accessibilityLabel={`Avaliar com ${star} estrelas`}
                        >
                          <Star
  size={27}
  color="#FFD700"
  fill={selected ? '#FFD700' : 'transparent'}
  strokeWidth={2}
/>
                        </Pressable>
                      );
                    },
                  )}
                </View>

                <View className="h-6 w-px bg-lavender-200" />

                <Text className="text-sm font-semibold text-night-500">
                  {rating !== null
                    ? `${rating} de 5`
                    : 'Ainda não avaliado'}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        <FormDivider />

        {/* SINOPSE + RESENHA */}
        <View className="p-5 md:p-8">
          <SectionHeader
            icon={Info}
            title="Sobre o livro"
            description="Registre a sinopse e, quando aplicável, suas impressões sobre a leitura."
          />

          <View className="gap-5 md:flex-row">
            <View className="md:flex-1">
              <BookFormInput
                label="Sinopse"
                value={synopsis}
                onChangeText={setSynopsis}
                multiline
                textAlignVertical="top"
                placeholder="Uma breve descrição do livro..."
                className="min-h-36 py-3"
              />
            </View>

            {!isToReadStatus(status) ? (
              <View className="md:flex-1">
                <BookFormInput
                  label="Resenha"
                  value={review}
                  onChangeText={setReview}
                  multiline
                  textAlignVertical="top"
                  placeholder="Sua opinião, pensamentos e notas sobre a leitura..."
                  className="min-h-36 py-3"
                />
              </View>
            ) : null}
          </View>
        </View>

        <FormDivider />

        {/* AÇÕES */}
        <View className="flex-col-reverse gap-3 p-5 md:flex-row md:items-center md:justify-end md:p-8">
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
            className="w-full md:w-auto md:px-7"
          />

          <Button
            title={submitLabel}
            onPress={handleSubmit}
            isLoading={
              isSubmitting ||
              isUploadingCover
            }
            className="w-full md:w-auto md:px-7"
          />
        </View>
      </Card>
    </View>
  );
}