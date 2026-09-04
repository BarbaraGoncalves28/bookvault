import { router, useFocusEffect } from 'expo-router';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  X,
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarArrowDown,
  CalendarArrowUp,
} from 'lucide-react-native';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { BookCard } from '../../components/books/book-card';
import { Breadcrumb } from '../../components/layout/breadcrumb';
import { Screen } from '../../components/layout/screen';
import { Button } from '../../components/ui/button';
import {
  FeedbackState,
  LoadingState,
} from '../../components/ui/feedback-state';
import { bookStatusLabels } from '../../constants/book-status';
import { booksService } from '../../services/books-service';
import type {
  Book,
  BookFilters,
  BookStatus,
} from '../../types/book';

type BooksListScreenProps = {
  title: string;
  filters?: BookFilters;
  showSearch?: boolean;
};

type SortOption =
  | 'recent'
  | 'oldest'
  | 'alphabetical'
  | 'alphabetical-reverse'
  | 'rating-high'
  | 'rating-low';

const BOOKS_PER_PAGE = 6;

const sortOptions: {
  value: SortOption;
  label: string;
}[] = [
  {
    value: 'recent',
    label: 'Mais recentes',
  },
  {
    value: 'oldest',
    label: 'Mais antigos',
  },
  {
    value: 'alphabetical',
    label: 'Título: A → Z',
  },
  {
    value: 'alphabetical-reverse',
    label: 'Título: Z → A',
  },
  {
    value: 'rating-high',
    label: 'Maior avaliação',
  },
  {
    value: 'rating-low',
    label: 'Menor avaliação',
  },
];

export function BooksListScreen({
  title,
  filters = {},
  showSearch = true,
}: BooksListScreenProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // =========================================================
  // FILTROS APLICADOS
  // =========================================================
  const [selectedGenre, setSelectedGenre] =
    useState<string | null>(null);

  const [selectedRating, setSelectedRating] =
    useState<number | null>(null);

  // =========================================================
  // FILTROS TEMPORÁRIOS DO MODAL
  // =========================================================
  const [draftGenre, setDraftGenre] =
    useState<string | null>(null);

  const [draftRating, setDraftRating] =
    useState<number | null>(null);

  const [sortOption, setSortOption] =
    useState<SortOption>('recent');

  const [isFilterModalVisible, setIsFilterModalVisible] =
    useState(false);

  const [isSortModalVisible, setIsSortModalVisible] =
    useState(false);

  // =========================================================
  // PAGINAÇÃO
  // =========================================================
  const [currentPage, setCurrentPage] = useState(1);

  const listRef = useRef<FlatList<Book>>(null);

  // =========================================================
  // EXCLUSÃO
  // =========================================================
  const [bookToDelete, setBookToDelete] =
    useState<Book | null>(null);

  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  // =========================================================
  // RESPONSIVIDADE
  // =========================================================
  const { width } = useWindowDimensions();

  const numColumns = width >= 768 ? 3 : 1;

  const cardWidth =
    width >= 768
      ? Math.min(
          (Math.min(width, 1024) - 32) / 3,
          330,
        )
      : Math.min(width - 32, 330);

  /*
   * BUSCA OS LIVROS
   *
   * O backend trabalha com paginação de 6 livros.
   *
   * Como os filtros de gênero, avaliação e ordenação
   * são aplicados localmente nesta tela, precisamos
   * buscar todas as páginas da API antes de montar
   * a paginação visual da tela.
   *
   * Exemplo:
   *
   * 7 livros no banco:
   * página 1 da API -> 6 livros
   * página 2 da API -> 1 livro
   *
   * Resultado final no frontend -> 7 livros
   * Paginação visual -> 2 páginas
   */
  const loadBooks = useCallback(async () => {
  setError(null);
  setIsLoading(true);

  try {
  // Busca o total REAL de livros da biblioteca,
  // sem considerar filtros como favoritos ou status.
  const libraryResponse = await booksService.list({
    page: 1,
  });

  setTotalBooks(
    libraryResponse.pagination?.totalItems ?? 0,
  );

  // Busca os livros da página atual considerando
  // os filtros da rota.
  const firstResponse = await booksService.list({
    ...filters,
    page: 1,
  });

  let allBooks = [...firstResponse.items];

    const totalPagesFromApi =
      firstResponse.pagination?.totalPages ?? 1;

    if (totalPagesFromApi > 1) {
      const remainingPages = await Promise.all(
        Array.from(
          { length: totalPagesFromApi - 1 },
          (_, index) =>
            booksService.list({
              ...filters,
              page: index + 2,
            }),
        ),
      );

      remainingPages.forEach((response) => {
        allBooks = [
          ...allBooks,
          ...response.items,
        ];
      });
    }

    setBooks(allBooks);
    setCurrentPage(1);
  } catch {
    setError(
      'Nao foi possivel carregar seus livros.',
    );
  } finally {
    setIsLoading(false);
  }
}, [
  filters.favorite,
  filters.status,
  filters.genreId,
  filters.minRating,
  filters.sort,
]);

  useEffect(() => {
    void loadBooks();
  }, [loadBooks]);

  useFocusEffect(
  useCallback(() => {
    void loadBooks();
  }, [loadBooks]),
);

  /*
   * EXTRAI TODOS OS GÊNEROS DISPONÍVEIS
   *
   * O BookVault permite mais de um gênero por livro.
   *
   * Agora usamos book.genres porque esse é o formato
   * definido no tipo Book:
   *
   * genres: BookGenre[]
   */
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();

    books.forEach((book) => {
      if (!book.genres?.length) {
        return;
      }

      book.genres.forEach((bookGenre) => {
        const genreName =
          bookGenre.genre?.name?.trim();

        if (genreName) {
          genres.add(genreName);
        }
      });
    });

    return Array.from(genres).sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    );
  }, [books]);

  /*
   * APLICA GÊNERO, AVALIAÇÃO E ORDENAÇÃO
   *
   * IMPORTANTE:
   * Aqui usamos selectedGenre e selectedRating,
   * que representam somente os filtros JÁ APLICADOS.
   *
   * Os valores temporários do modal ficam em
   * draftGenre e draftRating e não interferem
   * na lista enquanto o modal estiver aberto.
   */
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // BUSCA POR TÍTULO
  const searchTerm = search.trim().toLocaleLowerCase();

  if (searchTerm) {
    result = result.filter((book) =>
      book.title
        .trim()
        .toLocaleLowerCase()
        .includes(searchTerm),
    );
  }

    // GÊNERO
    if (selectedGenre) {
      result = result.filter((book) => {
        if (!book.genres?.length) {
          return false;
        }

        return book.genres.some(
          (bookGenre) =>
            bookGenre.genre?.name
              ?.trim()
              .toLowerCase() ===
            selectedGenre.trim().toLowerCase(),
        );
      });
    }

    // AVALIAÇÃO
    if (selectedRating !== null) {
      result = result.filter(
        (book) =>
          (book.rating ?? 0) >= selectedRating,
      );
    }

    // ORDENAÇÃO
    result.sort((a, b) => {
      switch (sortOption) {
        case 'alphabetical':
          return a.title.localeCompare(
            b.title,
            'pt-BR',
          );

        case 'alphabetical-reverse':
          return b.title.localeCompare(
            a.title,
            'pt-BR',
          );

        case 'rating-high':
          return (
            (b.rating ?? 0) -
            (a.rating ?? 0)
          );

        case 'rating-low':
          return (
            (a.rating ?? 0) -
            (b.rating ?? 0)
          );

        case 'oldest':
          return (
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          );

        case 'recent':
        default:
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
      }
    });

    return result;
  }, [
    books,
    search,
    selectedGenre,
    selectedRating,
    sortOption,
  ]);

  /*
   * PAGINAÇÃO
   *
   * Aqui a paginação é feita sobre TODOS os livros
   * carregados da API.
   *
   * 7 livros / 6 por página = 2 páginas.
   */
  const totalPages = Math.ceil(
    filteredAndSortedBooks.length /
      BOOKS_PER_PAGE,
  );

  const paginatedBooks = useMemo(() => {
    const startIndex =
      (currentPage - 1) * BOOKS_PER_PAGE;

    return filteredAndSortedBooks.slice(
      startIndex,
      startIndex + BOOKS_PER_PAGE,
    );
  }, [
    filteredAndSortedBooks,
    currentPage,
  ]);

  /*
   * VOLTA PARA A PRIMEIRA PÁGINA
   * QUANDO FILTROS OU ORDENAÇÃO MUDAM
   */
  useEffect(() => {
    setCurrentPage(1);

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: 0,
        animated: false,
      });
    });
  }, [
    selectedGenre,
    selectedRating,
    sortOption,
    search,
    filters.favorite,
    filters.status,
    filters.genreId,
    filters.minRating,
    filters.sort,
  ]);

  /*
   * GARANTE QUE A PÁGINA ATUAL EXISTE
   */
  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function goToPage(page: number) {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    setCurrentPage(page);

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    });
  }

  function goToPreviousPage() {
    goToPage(currentPage - 1);
  }

  function goToNextPage() {
    goToPage(currentPage + 1);
  }

  /*
   * ABRE O MODAL DE FILTROS
   *
   * Ao abrir, copiamos os filtros atualmente aplicados
   * para os filtros temporários do modal.
   *
   * Assim o usuário sempre começa vendo a seleção
   * que já está aplicada.
   */
  function openFilterModal() {
    setDraftGenre(selectedGenre);
    setDraftRating(selectedRating);
    setIsFilterModalVisible(true);
  }

  /*
   * APLICA OS FILTROS DO MODAL
   *
   * Somente aqui os filtros temporários passam a ser
   * os filtros realmente utilizados pela lista.
   *
   * Depois disso o modal fecha.
   */
  function applyFilters() {
    setSelectedGenre(draftGenre);
    setSelectedRating(draftRating);
    setIsFilterModalVisible(false);
  }

  /*
   * LIMPA OS FILTROS TEMPORÁRIOS DO MODAL
   *
   * Isso NÃO altera os cards imediatamente.
   * O usuário precisa clicar em "Aplicar filtros".
   */
  function clearDraftFilters() {
    setDraftGenre(null);
    setDraftRating(null);
  }

  /*
   * LIMPA TODOS OS FILTROS APLICADOS
   *
   * Usado pelo botão "Limpar filtros" que fica fora
   * do modal.
   */
  function clearFilters() {
    setSelectedGenre(null);
    setSelectedRating(null);

    setDraftGenre(null);
    setDraftRating(null);
  }


    const hasBooks = totalBooks > 0;
  const hasSearch = search.trim().length > 0;

  const hasAppliedFilters =
    selectedGenre !== null ||
    selectedRating !== null ||
    Boolean(filters.status) ||
    Boolean(filters.favorite) ||
    Boolean(filters.genreId) ||
    filters.minRating !== undefined;

  const getEmptyState = () => {
  // =========================================================
  // BUSCA SEM RESULTADOS
  // =========================================================
  if (
    hasSearch &&
    filteredAndSortedBooks.length === 0
  ) {
    return {
      title: 'Nenhum livro encontrado',
      message:
        'Não encontramos nenhum livro com esse título.',
      actionLabel: 'Limpar busca',
      onAction: () => setSearch(''),
    };
  }

  // =========================================================
  // BIBLIOTECA REALMENTE VAZIA
  // =========================================================
  if (!hasBooks) {
    return {
      title: 'Sua biblioteca está vazia',
      message: 'Cadastre seu primeiro livro.',
      actionLabel: 'Adicionar livro',
      onAction: () =>
        router.push('/livros/novo'),
    };
  }

  // =========================================================
  // NENHUM FAVORITO
  // =========================================================
  if (
    filteredAndSortedBooks.length === 0 &&
    filters.favorite
  ) {
    return {
      title: 'Nenhum livro favorito',
      message:
        'Você ainda não adicionou nenhum livro aos favoritos.',
      actionLabel: 'Ver todos os livros',
      onAction: () =>
        router.push('/livros'),
    };
  }

  // =========================================================
  // NENHUM LIVRO EM LEITURA
  // =========================================================
  if (
    filteredAndSortedBooks.length === 0 &&
    filters.status === 'READING'
  ) {
    return {
      title: 'Nenhum livro em leitura',
      message:
        'Você não possui livros marcados como "Lendo".',
      actionLabel: 'Ver todos os livros',
      onAction: () =>
        router.push('/livros'),
    };
  }

  // =========================================================
  // NENHUM LIVRO PARA LER
  // =========================================================
  if (
    filteredAndSortedBooks.length === 0 &&
    filters.status === 'TO_READ'
  ) {
    return {
      title: 'Nenhum livro para ler',
      message:
        'Você ainda não possui livros marcados como "Quero ler".',
      actionLabel: 'Ver todos os livros',
      onAction: () =>
        router.push('/livros'),
    };
  }

  // =========================================================
  // NENHUM LIVRO LIDO
  // =========================================================
  if (
    filteredAndSortedBooks.length === 0 &&
    filters.status === 'COMPLETED'
  ) {
    return {
      title: 'Nenhum livro lido',
      message:
        'Você ainda não marcou nenhum livro como "Lido".',
      actionLabel: 'Ver todos os livros',
      onAction: () =>
        router.push('/livros'),
    };
  }

  // =========================================================
  // FILTROS SEM RESULTADOS
  // =========================================================
  if (
    filteredAndSortedBooks.length === 0 &&
    (selectedGenre ||
      selectedRating !== null)
  ) {
    return {
      title: 'Nenhum livro corresponde aos filtros',
      message:
        'Tente ajustar ou limpar os filtros para encontrar seus livros.',
      actionLabel: 'Limpar filtros',
      onAction: clearFilters,
    };
  }

  return {
    title: 'Nenhum livro encontrado',
    message:
      'Nenhum livro corresponde aos critérios selecionados.',
    actionLabel: 'Limpar filtros',
    onAction: clearFilters,
  };
};

  const emptyState = getEmptyState();

  /*
   * QUANTIDADE DE FILTROS ATIVOS
   */
  const activeFilterCount =
    Number(selectedGenre !== null) +
    Number(selectedRating !== null);

  /*
   * ORDENAÇÃO ATUAL
   */
  const currentSortLabel =
    sortOptions.find(
      (option) =>
        option.value === sortOption,
    )?.label ?? 'Mais recentes';

  /*
   * PAGINAÇÃO INTELIGENTE
   */
  const paginationItems = useMemo<
    (number | 'ellipsis')[]
  >(() => {
    if (totalPages <= 1) {
      return [];
    }

    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1,
      );
    }

    const items: (number | 'ellipsis')[] = [];

    items.push(1);

    if (currentPage > 3) {
      items.push('ellipsis');
    }

    const start = Math.max(
      2,
      currentPage - 1,
    );

    const end = Math.min(
      totalPages - 1,
      currentPage + 1,
    );

    for (
      let page = start;
      page <= end;
      page++
    ) {
      items.push(page);
    }

    if (currentPage < totalPages - 2) {
      items.push('ellipsis');
    }

    items.push(totalPages);

    return items;
  }, [currentPage, totalPages]);

  /*
   * FAVORITO
   */
  async function toggleFavorite(book: Book) {
    try {
      const updatedBook = book.favorite
        ? await booksService.unfavorite(
            book.id,
          )
        : await booksService.favorite(
            book.id,
          );

      setBooks((current) =>
        current.map((item) =>
          item.id === updatedBook.id
            ? updatedBook
            : item,
        ),
      );
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2:
          error instanceof Error
            ? error.message
            : 'Não foi possível atualizar o favorito.',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  }

  /*
   * EXCLUSÃO
   */
  function openDeleteModal(book: Book) {
    setBookToDelete(book);
    setIsDeleteModalVisible(true);
  }

  function closeDeleteModal() {
    if (isDeleting) {
      return;
    }

    setIsDeleteModalVisible(false);
    setBookToDelete(null);
  }

  async function confirmDelete() {
    if (!bookToDelete || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);

      await booksService.remove(
        bookToDelete.id,
      );

      const updatedBooks = books.filter(
        (item) =>
          item.id !== bookToDelete.id,
      );

      setBooks(updatedBooks);

      setIsDeleteModalVisible(false);
      setBookToDelete(null);

      Toast.show({
        type: 'success',
        text1: 'Livro excluído',
        text2:
          'O livro foi removido da sua biblioteca.',
        position: 'top',
        visibilityTime: 2500,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao excluir livro',
        text2:
          error instanceof Error
            ? error.message
            : 'Não foi possível excluir o livro.',
        position: 'top',
        visibilityTime: 3500,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <Screen className="min-h-screen">
        <View className="flex-1 items-center justify-center">
          <LoadingState message="Carregando sua biblioteca..." />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen className="min-h-screen">
        <View className="flex-1 items-center justify-center">
          <FeedbackState
            title="Algo saiu do eixo"
            message={error}
            actionLabel="Tentar de novo"
            onAction={loadBooks}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* BREADCRUMB */}
      <Breadcrumb current={title} />

      {/* BUSCA + NOVO LIVRO */}
      {showSearch ? (
        <View className="mb-4 gap-3 md:flex-row md:items-center">
          {/* BUSCA */}
          <View className="min-h-12 flex-1 flex-row items-center gap-2 rounded-control border border-slate-200 bg-white px-4">
            <Search
              color="#777486"
              size={19}
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por título"
              placeholderTextColor="#9995A6"
              className="flex-1 text-base text-ink-950 outline-none"
            />

            {search.length > 0 ? (
              <Pressable
                onPress={() => setSearch('')}
                accessibilityRole="button"
                accessibilityLabel="Limpar busca"
              >
                <X
                  size={17}
                  color="#777486"
                />
              </Pressable>
            ) : null}
          </View>

          {/* NOVO LIVRO */}
          <View className="md:w-auto">
            <Button
              title="Novo livro"
              onPress={() =>
                router.push('/livros/novo')
              }
              icon={
                <Plus
                  color="#ffffff"
                  size={18}
                />
              }
            />
          </View>
        </View>
      ) : (
        <View className="mb-5">
          <Button
            title="Novo livro"
            onPress={() =>
              router.push('/livros/novo')
            }
            icon={
              <Plus
                color="#ffffff"
                size={18}
              />
            }
          />
        </View>
      )}

      {/* FILTROS + ORDENAÇÃO */}
      <View className="mb-5 gap-3 md:flex-row">
        {/* FILTROS */}
        <Pressable
          onPress={openFilterModal}
          accessibilityRole="button"
          className={`min-h-11 flex-row items-center justify-center gap-2 rounded-control border px-4 ${
            activeFilterCount > 0
              ? 'border-brand-500 bg-brand-50'
              : 'border-lavender-200 bg-white'
          }`}
        >
          <SlidersHorizontal
            size={17}
            color="#7057D9"
          />

          <Text className="font-semibold text-night-500">
            Filtros
          </Text>

          {activeFilterCount > 0 ? (
            <View className="h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5">
              <Text className="text-[11px] font-bold text-white">
                {activeFilterCount}
              </Text>
            </View>
          ) : null}
        </Pressable>

        {/* ORDENAR */}
        <Pressable
          onPress={() =>
            setIsSortModalVisible(true)
          }
          accessibilityRole="button"
          className="min-h-11 flex-row items-center justify-center gap-2 rounded-control border border-lavender-200 bg-white px-4"
        >
          <ListFilter
            size={17}
            color="#7057D9"
          />

          <Text className="font-semibold text-night-500">
            Ordenar
          </Text>

          <Text className="hidden font-semibold text-night-500 md:flex">
            • {currentSortLabel}
          </Text>

          <ChevronDown
            size={16}
            color="#777486"
          />
        </Pressable>
      </View>

      {/* CONTADOR */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-sm text-night-500">
          {filteredAndSortedBooks.length === 1
            ? '1 livro encontrado'
            : `${filteredAndSortedBooks.length} livros encontrados`}
        </Text>

        {activeFilterCount > 0 ? (
          <Pressable
            onPress={clearFilters}
            accessibilityRole="button"
          >
            <Text className="text-sm font-semibold text-brand-500">
              Limpar filtros
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* LISTA DE LIVROS */}
      <FlatList
        ref={listRef}
        key={numColumns}
        data={paginatedBooks}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerClassName="gap-5 pb-3"
        columnWrapperClassName={
          numColumns > 1
            ? 'justify-start gap-4'
            : undefined
        }
        renderItem={({ item }) => (
          <View
            style={{
              width:
                numColumns === 3
                  ? '32%'
                  : cardWidth,
            }}
          >
            <BookCard
              book={item}
              onPress={() =>
                router.push(
                  `/livros/${item.id}`,
                )
              }
              onToggleFavorite={() =>
                void toggleFavorite(item)
              }
              onEdit={() =>
                router.push(
                  `/livros/${item.id}/editar`,
                )
              }
              onDelete={() =>
                openDeleteModal(item)
              }
            />
          </View>
        )}
        ListEmptyComponent={
  <FeedbackState
    title={emptyState.title}
    message={emptyState.message}
    actionLabel={emptyState.actionLabel}
    onAction={emptyState.onAction}
  />
}
      />

      {/* PAGINAÇÃO */}
      {totalPages > 1 ? (
        <View className="mt-5 items-center">
          <View className="flex-row items-center gap-2 rounded-2xl border border-lavender-200 bg-white p-2 shadow-soft">
            {/* ANTERIOR */}
            <Pressable
              onPress={goToPreviousPage}
              disabled={currentPage === 1}
              accessibilityRole="button"
              accessibilityLabel="Página anterior"
              className={`h-10 w-10 items-center justify-center rounded-xl ${
                currentPage === 1
                  ? 'bg-lavender-100'
                  : 'bg-white'
              }`}
            >
              <ChevronLeft
                size={19}
                color={
                  currentPage === 1
                    ? '#C7C3D0'
                    : '#7057D9'
                }
                strokeWidth={2.2}
              />
            </Pressable>

            {/* PÁGINAS */}
            <View className="flex-row items-center gap-1">
              {paginationItems.map(
                (item, index) => {
                  if (
                    item === 'ellipsis'
                  ) {
                    return (
                      <View
                        key={`ellipsis-${index}`}
                        className="h-10 w-8 items-center justify-center"
                      >
                        <Text className="text-sm font-semibold text-night-400">
                          ...
                        </Text>
                      </View>
                    );
                  }

                  const isActive =
                    item === currentPage;

                  return (
                    <Pressable
                      key={item}
                      onPress={() =>
                        goToPage(item)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Página ${item}`}
                      accessibilityState={{
                        selected: isActive,
                      }}
                      className={`h-10 min-w-10 items-center justify-center rounded-xl px-3 ${
                        isActive
                          ? 'bg-brand-500'
                          : 'bg-transparent'
                      }`}
                    >
                      <Text
                        className={`text-sm font-bold ${
                          isActive
                            ? 'text-white'
                            : 'text-night-500'
                        }`}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>

            {/* PRÓXIMA */}
            <Pressable
              onPress={goToNextPage}
              disabled={
                currentPage === totalPages
              }
              accessibilityRole="button"
              accessibilityLabel="Próxima página"
              className={`h-10 w-10 items-center justify-center rounded-xl ${
                currentPage === totalPages
                  ? 'bg-lavender-100'
                  : 'bg-white'
              }`}
            >
              <ChevronRight
                size={19}
                color={
                  currentPage === totalPages
                    ? '#C7C3D0'
                    : '#7057D9'
                }
                strokeWidth={2.2}
              />
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* =====================================================
          MODAL — FILTROS
          ===================================================== */}
      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setIsFilterModalVisible(false)
        }
      >
        <View className="flex-1 justify-end bg-black/40 md:items-center md:justify-center md:px-6">
          <View className="max-h-[85%] w-full rounded-t-[28px] bg-white p-6 md:max-w-lg md:rounded-[28px]">
            {/* CABEÇALHO */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-night-900">
                  Filtros
                </Text>

                <Text className="mt-1 text-sm text-night-500">
                  Encontre exatamente o que procura
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setIsFilterModalVisible(
                    false,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Fechar filtros"
                className="h-9 w-9 items-center justify-center rounded-full bg-lavender-100"
              >
                <X
                  size={18}
                  color="#777486"
                />
              </Pressable>
            </View>

            {/* GÊNERO */}
            <View className="mt-7">
              <Text className="mb-3 text-base font-bold text-night-900">
                Gênero:
              </Text>

              <View className="flex-row flex-wrap gap-2">
                <Pressable
                  onPress={() =>
                    setDraftGenre(null)
                  }
                  className={`rounded-full border px-4 py-2.5 ${
                    draftGenre === null
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-lavender-200 bg-white'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      draftGenre === null
                        ? 'text-brand-500'
                        : 'text-night-500'
                    }`}
                  >
                    Todos
                  </Text>
                </Pressable>

                {availableGenres.map(
                  (genre) => {
                    const selected =
                      draftGenre ===
                      genre;

                    return (
                      <Pressable
                        key={genre}
                        onPress={() =>
                          setDraftGenre(
                            selected
                              ? null
                              : genre,
                          )
                        }
                        className={`rounded-full border px-4 py-2.5 ${
                          selected
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-lavender-200 bg-white'
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            selected
                              ? 'text-brand-500'
                              : 'text-night-500'
                          }`}
                        >
                          {genre}
                        </Text>
                      </Pressable>
                    );
                  },
                )}
              </View>
            </View>

            {/* AVALIAÇÃO */}
            <View className="mt-7">
              <Text className="mb-3 text-base font-bold text-night-900">
                Avaliação mínima:
              </Text>

              <View className="flex-row gap-2">
                {[null, 3, 4, 5].map(
                  (rating) => {
                    const selected =
                      draftRating ===
                      rating;

                    return (
                      <Pressable
                        key={
                          rating ?? 'any-rating'
                        }
                        onPress={() =>
                          setDraftRating(
                            rating,
                          )
                        }
                        className={`flex-1 items-center justify-center rounded-xl border px-3 py-3 ${
                          selected
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-lavender-200 bg-white'
                        }`}
                      >
                        {rating === null ? (
                          <Text
                            className={`text-xs font-semibold ${
                              selected
                                ? 'text-brand-500'
                                : 'text-night-500'
                            }`}
                          >
                            Todas
                          </Text>
                        ) : (
                          <View className="flex-row items-center gap-1">
                            <Star
                              size={14}
                              color="#FFD700"
                              fill="#FFD700"
                            />

                            <Text
                              className={`text-sm font-bold ${
                                selected
                                  ? 'text-brand-500'
                                  : 'text-night-500'
                              }`}
                            >
                              {rating}+
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  },
                )}
              </View>
            </View>

            {/* AÇÕES */}
            <View className="mt-8 flex-row gap-3 border-t border-lavender-200 pt-5">
              {/* LIMPAR */}
              <Pressable
                onPress={clearDraftFilters}
                className="h-12 flex-1 items-center justify-center rounded-xl bg-night-100"
              >
                <Text className="font-semibold text-night-700">
                  Limpar
                </Text>
              </Pressable>

              {/* APLICAR */}
              <Pressable
                onPress={applyFilters}
                className="h-12 flex-1 items-center justify-center rounded-xl bg-brand-500"
              >
                <Text className="font-semibold text-white">
                  Aplicar filtros
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          MODAL — ORDENAR
          ===================================================== */}
      <Modal
        visible={isSortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setIsSortModalVisible(false)
        }
      >
        <View className="flex-1 justify-end bg-black/40 md:items-center md:justify-center md:px-6">
          <View className="w-full rounded-t-[28px] bg-white p-6 md:max-w-md md:rounded-[28px]">
            {/* CABEÇALHO */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-night-900">
                  Ordenar livros
                </Text>

                <Text className="mt-1 text-sm text-night-500">
                  Escolha como seus livros serão exibidos
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setIsSortModalVisible(
                    false,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Fechar ordenação"
                className="h-9 w-9 items-center justify-center rounded-full bg-lavender-100"
              >
                <X
                  size={18}
                  color="#777486"
                />
              </Pressable>
            </View>

            {/* OPÇÕES */}
            <View className="mt-6 gap-2">
              {sortOptions.map(
                (option) => {
                  const selected =
                    sortOption ===
                    option.value;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        setSortOption(
                          option.value,
                        );

                        setIsSortModalVisible(
                          false,
                        );
                      }}
                      className={`min-h-12 flex-row items-center justify-between rounded-xl border px-4 ${
                        selected
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-lavender-200 bg-white'
                      }`}
                    >
                      <View className="flex-row items-center gap-3">
                        {option.value ===
                        'alphabetical' ? (
                          <ArrowDownAZ
                            size={18}
                            color="#7057D9"
                          />
                        ) : null}

                        {option.value ===
                        'alphabetical-reverse' ? (
                          <ArrowUpAZ
                            size={18}
                            color="#7057D9"
                          />
                        ) : null}

                        {option.value ===
                        'recent' ? (
                          <CalendarArrowDown
                            size={18}
                            color="#7057D9"
                          />
                        ) : null}

                        {option.value ===
                        'oldest' ? (
                          <CalendarArrowUp
                            size={18}
                            color="#7057D9"
                          />
                        ) : null}

                        {option.value ===
                          'rating-high' ||
                        option.value ===
                          'rating-low' ? (
                          <Star
                            size={18}
                            color="#7057D9"
                          />
                        ) : null}

                        <Text
                          className={`font-semibold ${
                            selected
                              ? 'text-brand-500'
                              : 'text-night-700'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </View>

                      <View
                        className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                          selected
                            ? 'border-brand-500'
                            : 'border-lavender-200'
                        }`}
                      >
                        {selected ? (
                          <View className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                },
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
          ===================================================== */}
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
                  "{bookToDelete?.title}"
                </Text>{' '}
                da sua biblioteca?
              </Text>
            </View>

            <View className="mt-6 gap-3">
              {/* CANCELAR */}
              <Pressable
                onPress={closeDeleteModal}
                disabled={isDeleting}
                className="h-12 items-center justify-center rounded-xl bg-night-100"
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
                className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-danger"
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
    </Screen>
  );
}