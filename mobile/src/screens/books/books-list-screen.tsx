import { router, useFocusEffect } from "expo-router";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  BookOpen,
  CalendarArrowDown,
  CalendarArrowUp,
  Check,
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
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";

import { BookCard } from "../../components/books/book-card";
import { Breadcrumb } from "../../components/layout/breadcrumb";
import { Screen } from "../../components/layout/screen";
import {
  FeedbackState,
  LoadingState,
} from "../../components/ui/feedback-state";
import { booksService } from "../../services/books-service";
import type { Book, BookFilters } from "../../types/book";

type BooksListScreenProps = {
  title: string;
  filters?: BookFilters;
  showSearch?: boolean;
};

type SortOption =
  | "recent"
  | "oldest"
  | "alphabetical"
  | "alphabetical-reverse"
  | "rating-high"
  | "rating-low";

const BOOKS_PER_PAGE = 6;

const sortOptions: {
  value: SortOption;
  label: string;
  description: string;
}[] = [
  {
    value: "recent",
    label: "Mais recentes",
    description: "Adicionados recentemente",
  },
  {
    value: "oldest",
    label: "Mais antigos",
    description: "Adicionados há mais tempo",
  },
  {
    value: "alphabetical",
    label: "Título: A → Z",
    description: "Ordem alfabética crescente",
  },
  {
    value: "alphabetical-reverse",
    label: "Título: Z → A",
    description: "Ordem alfabética decrescente",
  },
  {
    value: "rating-high",
    label: "Maior avaliação",
    description: "Melhores avaliações primeiro",
  },
  {
    value: "rating-low",
    label: "Menor avaliação",
    description: "Menores avaliações primeiro",
  },
];

export function BooksListScreen({
  title,
  filters = {},
  showSearch = true,
}: BooksListScreenProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // =========================================================
  // FILTROS APLICADOS
  // =========================================================

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // =========================================================
  // FILTROS TEMPORÁRIOS DO MODAL
  // =========================================================

  const [draftGenre, setDraftGenre] = useState<string | null>(null);

  const [draftRating, setDraftRating] = useState<number | null>(null);

  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  // =========================================================
  // PAGINAÇÃO
  // =========================================================

  const [currentPage, setCurrentPage] = useState(1);

  const listRef = useRef<FlatList<Book>>(null);

  // =========================================================
  // EXCLUSÃO
  // =========================================================

  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  // =========================================================
  // RESPONSIVIDADE
  // =========================================================

  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  const numColumns = width >= 768 ? 3 : 1;

  const cardWidth =
    width >= 768
      ? Math.min((Math.min(width, 1024) - 32) / 3, 330)
      : Math.min(width - 32, 330);

  // =========================================================
  // BUSCAR LIVROS
  // =========================================================

  const loadBooks = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const libraryResponse = await booksService.list({
        page: 1,
      });

      setTotalBooks(libraryResponse.pagination?.totalItems ?? 0);

      const firstResponse = await booksService.list({
        ...filters,
        page: 1,
      });

      let allBooks = [...firstResponse.items];

      const totalPagesFromApi = firstResponse.pagination?.totalPages ?? 1;

      if (totalPagesFromApi > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: totalPagesFromApi - 1 }, (_, index) =>
            booksService.list({
              ...filters,
              page: index + 2,
            }),
          ),
        );

        remainingPages.forEach((response) => {
          allBooks = [...allBooks, ...response.items];
        });
      }

      setBooks(allBooks);
      setCurrentPage(1);
    } catch {
      setError("Não foi possível carregar seus livros.");
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

  // =========================================================
  // GÊNEROS DISPONÍVEIS
  // =========================================================

  const availableGenres = useMemo(() => {
    const genres = new Set<string>();

    books.forEach((book) => {
      if (!book.genres?.length) {
        return;
      }

      book.genres.forEach((bookGenre) => {
        const genreName = bookGenre.genre?.name?.trim();

        if (genreName) {
          genres.add(genreName);
        }
      });
    });

    return Array.from(genres).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [books]);

  // =========================================================
  // FILTROS + BUSCA + ORDENAÇÃO
  // =========================================================

  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    const searchTerm = search.trim().toLocaleLowerCase();

    if (searchTerm) {
      result = result.filter((book) =>
        book.title.trim().toLocaleLowerCase().includes(searchTerm),
      );
    }

    if (selectedGenre) {
      result = result.filter((book) => {
        if (!book.genres?.length) {
          return false;
        }

        return book.genres.some(
          (bookGenre) =>
            bookGenre.genre?.name?.trim().toLowerCase() ===
            selectedGenre.trim().toLowerCase(),
        );
      });
    }

    if (selectedRating !== null) {
      result = result.filter((book) => (book.rating ?? 0) >= selectedRating);
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "alphabetical":
          return a.title.localeCompare(b.title, "pt-BR");

        case "alphabetical-reverse":
          return b.title.localeCompare(a.title, "pt-BR");

        case "rating-high":
          return (b.rating ?? 0) - (a.rating ?? 0);

        case "rating-low":
          return (a.rating ?? 0) - (b.rating ?? 0);

        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        case "recent":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return result;
  }, [books, search, selectedGenre, selectedRating, sortOption]);

  // =========================================================
  // PAGINAÇÃO
  // =========================================================

  const totalPages = Math.ceil(filteredAndSortedBooks.length / BOOKS_PER_PAGE);

  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;

    return filteredAndSortedBooks.slice(
      startIndex,
      startIndex + BOOKS_PER_PAGE,
    );
  }, [filteredAndSortedBooks, currentPage]);

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

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function goToPage(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) {
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

  // =========================================================
  // FILTROS
  // =========================================================

  function openFilterModal() {
    setDraftGenre(selectedGenre);
    setDraftRating(selectedRating);
    setIsFilterModalVisible(true);
  }

  function applyFilters() {
    setSelectedGenre(draftGenre);
    setSelectedRating(draftRating);
    setIsFilterModalVisible(false);
  }

  function clearDraftFilters() {
    setDraftGenre(null);
    setDraftRating(null);
  }

  function clearFilters() {
    setSelectedGenre(null);
    setSelectedRating(null);
    setDraftGenre(null);
    setDraftRating(null);
  }

  // =========================================================
  // ESTADOS
  // =========================================================

  const hasBooks = totalBooks > 0;
  const hasSearch = search.trim().length > 0;

  const hasAppliedFilters =
    selectedGenre !== null ||
    selectedRating !== null ||
    Boolean(filters.status) ||
    Boolean(filters.favorite) ||
    Boolean(filters.genreId) ||
    filters.minRating !== undefined;

  const activeFilterCount =
    Number(selectedGenre !== null) + Number(selectedRating !== null);

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortOption)?.label ??
    "Mais recentes";

  const getEmptyState = () => {
    if (hasSearch && filteredAndSortedBooks.length === 0) {
      return {
        title: "Nenhum livro encontrado",
        message: "Não encontramos nenhum livro com esse título.",
        actionLabel: "Limpar busca",
        onAction: () => setSearch(""),
      };
    }

    if (!hasBooks) {
      return {
        title: "Sua biblioteca está vazia",
        message: "Cadastre seu primeiro livro.",
        actionLabel: "Adicionar livro",
        onAction: () => router.push("/livros/novo"),
      };
    }

    if (filteredAndSortedBooks.length === 0 && filters.favorite) {
      return {
        title: "Nenhum livro favorito",
        message: "Você ainda não adicionou nenhum livro aos favoritos.",
        actionLabel: "Ver todos os livros",
        onAction: () => router.push("/livros"),
      };
    }

    if (filteredAndSortedBooks.length === 0 && filters.status === "READING") {
      return {
        title: "Nenhum livro em leitura",
        message: 'Você não possui livros marcados como "Lendo".',
        actionLabel: "Ver todos os livros",
        onAction: () => router.push("/livros"),
      };
    }

    if (filteredAndSortedBooks.length === 0 && filters.status === "TO_READ") {
      return {
        title: "Nenhum livro para ler",
        message: 'Você ainda não possui livros marcados como "Quero ler".',
        actionLabel: "Ver todos os livros",
        onAction: () => router.push("/livros"),
      };
    }

    if (filteredAndSortedBooks.length === 0 && filters.status === "COMPLETED") {
      return {
        title: "Nenhum livro lido",
        message: 'Você ainda não marcou nenhum livro como "Lido".',
        actionLabel: "Ver todos os livros",
        onAction: () => router.push("/livros"),
      };
    }

    if (
      filteredAndSortedBooks.length === 0 &&
      (selectedGenre || selectedRating !== null)
    ) {
      return {
        title: "Nenhum livro corresponde aos filtros",
        message:
          "Tente ajustar ou limpar os filtros para encontrar seus livros.",
        actionLabel: "Limpar filtros",
        onAction: clearFilters,
      };
    }

    return {
      title: "Nenhum livro encontrado",
      message: "Nenhum livro corresponde aos critérios selecionados.",
      actionLabel: "Limpar filtros",
      onAction: clearFilters,
    };
  };

  const emptyState = getEmptyState();

  // =========================================================
  // PAGINAÇÃO INTELIGENTE
  // =========================================================

  const paginationItems = useMemo<(number | "ellipsis")[]>(() => {
    if (totalPages <= 1) {
      return [];
    }

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items: (number | "ellipsis")[] = [];

    items.push(1);

    if (currentPage > 3) {
      items.push("ellipsis");
    }

    const start = Math.max(2, currentPage - 1);

    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let page = start; page <= end; page++) {
      items.push(page);
    }

    if (currentPage < totalPages - 2) {
      items.push("ellipsis");
    }

    items.push(totalPages);

    return items;
  }, [currentPage, totalPages]);

  // =========================================================
  // FAVORITO
  // =========================================================

  async function toggleFavorite(book: Book) {
    try {
      const updatedBook = book.favorite
        ? await booksService.unfavorite(book.id)
        : await booksService.favorite(book.id);

      setBooks((current) =>
        current.map((item) =>
          item.id === updatedBook.id ? updatedBook : item,
        ),
      );
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o favorito.",
        position: "top",
        visibilityTime: 3000,
      });
    }
  }

  // =========================================================
  // EXCLUSÃO
  // =========================================================

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

      await booksService.remove(bookToDelete.id);

      const updatedBooks = books.filter((item) => item.id !== bookToDelete.id);

      setBooks(updatedBooks);

      setIsDeleteModalVisible(false);
      setBookToDelete(null);

      Toast.show({
        type: "success",
        text1: "Livro excluído",
        text2: "O livro foi removido da sua biblioteca.",
        position: "top",
        visibilityTime: 2500,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro ao excluir livro",
        text2:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o livro.",
        position: "top",
        visibilityTime: 3500,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <Screen className="flex-1 min-h-0">
        <View className="flex-1 items-center justify-center">
          <LoadingState message="Carregando sua biblioteca..." />
        </View>
      </Screen>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <Screen className="flex-1 min-h-0">
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
    <Screen className={isMobile ? 'flex-1 min-h-0' : undefined}>
      <View className={isMobile ? 'min-h-0 flex-1' : undefined}>
        {/* =====================================================
          CABEÇALHO
          ===================================================== */}

        <Breadcrumb current={title} />

        <View className="mb-5 md:mb-6">
          <Text className="text-xl font-bold text-[#201E2E] md:text-2xl">
            {title}
          </Text>

          <Text className="mt-1 text-[13px] leading-5 text-[#777486] md:text-sm">
            Organize e encontre seus livros com facilidade.
          </Text>
        </View>

        {/* =====================================================
          BARRA DE BUSCA + NOVO LIVRO
          ===================================================== */}

        {showSearch ? (
          <View className="mb-4 flex-row items-center gap-2.5 md:gap-3">
            {/* BUSCA */}

            <View
              className="
        h-12
        min-w-0
        flex-1
        flex-row
        items-center
        rounded-2xl
        border
        border-[#E5E1EE]
        bg-white
        px-3
        md:h-14
        md:px-4
      "
              style={{
                shadowColor: "#17152B",
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              <View
                className="
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-[#F2F0FA]
        "
              >
                <Search color="#B100CD" size={18} strokeWidth={2.2} />
              </View>

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por título..."
                placeholderTextColor="#9995A6"
                className="
          ml-2.5
          min-w-0
          flex-1
          text-[14px]
          text-[#201E2E]
          outline-none
          md:ml-3
          md:text-[15px]
        "
              />

              {search.length > 0 ? (
                <Pressable
                  onPress={() => setSearch("")}
                  accessibilityRole="button"
                  accessibilityLabel="Limpar busca"
                  className="
            ml-1
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#F2F0FA]
          "
                >
                  <X size={16} color="#777486" strokeWidth={2.2} />
                </Pressable>
              ) : null}
            </View>

            {/* NOVO LIVRO */}

            <Pressable
              onPress={() => router.push("/livros/novo")}
              accessibilityRole="button"
              className="
        h-12
        shrink-0
        flex-row
        items-center
        justify-center
        gap-1.5
        rounded-2xl
        bg-[#B100CD]
        px-3.5
        md:h-14
        md:gap-2
        md:px-5
      "
              style={{
                shadowColor: "#B100CD",
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowOpacity: 0.22,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <View
                className="
          h-7
          w-7
          items-center
          justify-center
          rounded-lg
          bg-white/15
        "
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
              </View>

              <Text className="text-[13px] font-bold text-white md:text-sm">
                Novo livro
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="mb-5">
            <Pressable
              onPress={() => router.push("/livros/novo")}
              className="
        h-12
        shrink-0
        flex-row
        items-center
        justify-center
        gap-1.5
        self-start
        rounded-2xl
        bg-[#B100CD]
        px-4
        md:h-14
        md:gap-2
        md:px-5
      "
              style={{
                shadowColor: "#B100CD",
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowOpacity: 0.22,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <Plus color="#FFFFFF" size={18} strokeWidth={2.5} />

              <Text className="text-[13px] font-bold text-white md:text-sm">
                Novo livro
              </Text>
            </Pressable>
          </View>
        )}

        {/* =====================================================
          BARRA DE CONTROLES
          ===================================================== */}

        <View className="mb-5 gap-3 md:flex-row md:items-center md:justify-between">
          <View className="flex-row flex-wrap gap-2">
            {/* FILTROS */}

            <Pressable
              onPress={openFilterModal}
              accessibilityRole="button"
              className={`
              min-h-11
              flex-row
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              px-4
              ${
                activeFilterCount > 0
                  ? "border-[#B100CD] bg-[#F8E9FA]"
                  : "border-[#E5E1EE] bg-white"
              }
            `}
            >
              <SlidersHorizontal
                size={17}
                color={activeFilterCount > 0 ? "#B100CD" : "#7057D9"}
                strokeWidth={2.2}
              />

              <Text
                className={`
                text-sm
                font-bold
                ${activeFilterCount > 0 ? "text-[#B100CD]" : "text-[#201E2E]"}
              `}
              >
                Filtros
              </Text>

              {activeFilterCount > 0 ? (
                <View className="h-5 min-w-5 items-center justify-center rounded-full bg-[#B100CD] px-1.5">
                  <Text className="text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>

            {/* ORDENAR */}

            <Pressable
              onPress={() => setIsSortModalVisible(true)}
              accessibilityRole="button"
              className="
              min-h-11
              flex-row
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-[#E5E1EE]
              bg-white
              px-4
            "
            >
              <ListFilter size={17} color="#7057D9" strokeWidth={2.2} />

              <Text className="text-sm font-bold text-[#201E2E]">Ordenar</Text>

              <Text className="hidden text-sm font-semibold text-[#777486] md:flex">
                • {currentSortLabel}
              </Text>

              <ChevronDown size={16} color="#777486" strokeWidth={2.2} />
            </Pressable>
          </View>

          {/* RESUMO */}

          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-[#B100CD]" />

              <Text className="text-sm text-[#777486]">
                {filteredAndSortedBooks.length === 1
                  ? "1 livro encontrado"
                  : `${filteredAndSortedBooks.length} livros encontrados`}
              </Text>
            </View>

            {activeFilterCount > 0 ? (
              <Pressable onPress={clearFilters} accessibilityRole="button">
                <Text className="text-sm font-bold text-[#B100CD]">
                  Limpar filtros
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* =====================================================
          FILTROS ATIVOS
          ===================================================== */}

        {activeFilterCount > 0 ? (
          <View className="mb-5 flex-row flex-wrap gap-2">
            {selectedGenre ? (
              <View className="flex-row items-center gap-2 rounded-full border border-[#E5C4EB] bg-[#FBF2FC] px-3 py-2">
                <Text className="text-xs font-semibold text-[#8A00C2]">
                  Gênero: {selectedGenre}
                </Text>

                <Pressable onPress={() => setSelectedGenre(null)} hitSlop={6}>
                  <X size={13} color="#8A00C2" strokeWidth={2.5} />
                </Pressable>
              </View>
            ) : null}

            {selectedRating !== null ? (
              <View className="flex-row items-center gap-2 rounded-full border border-[#E5C4EB] bg-[#FBF2FC] px-3 py-2">
                <Star
                  size={13}
                  color="#FFD700"
                  fill="#FFD700"
                  strokeWidth={1.8}
                />

                <Text className="text-xs font-semibold text-[#8A00C2]">
                  {selectedRating}+ estrelas
                </Text>

                <Pressable onPress={() => setSelectedRating(null)} hitSlop={6}>
                  <X size={13} color="#8A00C2" strokeWidth={2.5} />
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* =====================================================
          LISTA DE LIVROS
          ===================================================== */}

        <FlatList
          ref={listRef}
          key={numColumns}
          data={paginatedBooks}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          className={isMobile ? 'min-h-0 flex-1' : undefined}
          contentContainerClassName="w-full gap-5 pb-8"
          columnWrapperClassName={
            numColumns > 1 ? "justify-start gap-4" : undefined
          }
          renderItem={({ item }) => (
            <View
              className={numColumns === 1 ? "self-center" : undefined}
              style={{
                width: numColumns === 3 ? "32%" : cardWidth,
              }}
            >
              <BookCard
                book={item}
                onPress={() => router.push(`/livros/${item.id}`)}
                onToggleFavorite={() => void toggleFavorite(item)}
                onEdit={() => router.push(`/livros/${item.id}/editar`)}
                onDelete={() => openDeleteModal(item)}
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
          ListFooterComponent={
            totalPages > 1 ? (
              <View className="mt-2 w-full items-center pb-2 md:mt-4">
                <View
                  className="
          flex-row
          items-center
          gap-1.5
          rounded-2xl
          border
          border-[#E5E1EE]
          bg-white
          p-2
        "
                  style={{
                    shadowColor: "#17152B",
                    shadowOffset: {
                      width: 0,
                      height: 3,
                    },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 2,
                  }}
                >
                  {/* ANTERIOR */}
                  <Pressable
                    onPress={goToPreviousPage}
                    disabled={currentPage === 1}
                    accessibilityRole="button"
                    accessibilityLabel="Página anterior"
                    className={`
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            ${currentPage === 1 ? "bg-[#F2F0FA]" : "bg-transparent"}
          `}
                  >
                    <ChevronLeft
                      size={19}
                      color={currentPage === 1 ? "#C7C3D0" : "#7057D9"}
                      strokeWidth={2.2}
                    />
                  </Pressable>

                  {/* PÁGINAS */}
                  <View className="flex-row items-center gap-1">
                    {paginationItems.map((item, index) => {
                      if (item === "ellipsis") {
                        return (
                          <View
                            key={`ellipsis-${index}`}
                            className="h-10 w-8 items-center justify-center"
                          >
                            <Text className="text-sm font-semibold text-[#777486]">
                              ...
                            </Text>
                          </View>
                        );
                      }

                      const isActive = item === currentPage;

                      return (
                        <Pressable
                          key={item}
                          onPress={() => goToPage(item)}
                          accessibilityRole="button"
                          accessibilityLabel={`Página ${item}`}
                          accessibilityState={{
                            selected: isActive,
                          }}
                          className={`
                  h-10
                  min-w-10
                  items-center
                  justify-center
                  rounded-xl
                  px-3
                  ${isActive ? "bg-[#B100CD]" : "bg-transparent"}
                `}
                        >
                          <Text
                            className={`
                    text-sm
                    font-bold
                    ${isActive ? "text-white" : "text-[#777486]"}
                  `}
                          >
                            {item}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* PRÓXIMA */}
                  <Pressable
                    onPress={goToNextPage}
                    disabled={currentPage === totalPages}
                    accessibilityRole="button"
                    accessibilityLabel="Próxima página"
                    className={`
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            ${currentPage === totalPages ? "bg-[#F2F0FA]" : "bg-transparent"}
          `}
                  >
                    <ChevronRight
                      size={19}
                      color={currentPage === totalPages ? "#C7C3D0" : "#7057D9"}
                      strokeWidth={2.2}
                    />
                  </Pressable>
                </View>
              </View>
            ) : null
          }
        />
      </View>

      {/*=====================================================
          MODAL — FILTROS
          ===================================================== */}

      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-[#17152B]/60 md:items-center md:justify-center md:px-6">
          <View
            className="
              max-h-[88%]
              w-full
              rounded-t-[30px]
              bg-white
              p-6
              md:max-w-xl
              md:rounded-[30px]
            "
            style={{
              shadowColor: "#17152B",
              shadowOffset: {
                width: 0,
                height: 10,
              },
              shadowOpacity: 0.18,
              shadowRadius: 30,
              elevation: 15,
            }}
          >
            {/* CABEÇALHO */}

            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <View className="mb-2 flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-xl bg-[#F8E9FA]">
                    <SlidersHorizontal
                      size={16}
                      color="#B100CD"
                      strokeWidth={2.3}
                    />
                  </View>

                  <Text className="text-xl font-bold text-[#201E2E]">
                    Filtros
                  </Text>
                </View>

                <Text className="text-sm leading-5 text-[#777486]">
                  Refine sua biblioteca e encontre exatamente o que procura.
                </Text>
              </View>

              <Pressable
                onPress={() => setIsFilterModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Fechar filtros"
                className="
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#E5E1EE]
                  bg-[#F8F7FB]
                "
              >
                <X size={18} color="#777486" strokeWidth={2.2} />
              </Pressable>
            </View>

            {/* DIVISOR */}

            <View className="mt-6 h-px bg-[#E5E1EE]" />

            {/* GÊNERO */}

            <View className="mt-6">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-base font-bold text-[#201E2E]">
                  Gênero
                </Text>

                {draftGenre ? (
                  <Text className="text-xs font-semibold text-[#B100CD]">
                    1 selecionado
                  </Text>
                ) : null}
              </View>

              <View className="flex-row flex-wrap gap-2">
                <Pressable
                  onPress={() => setDraftGenre(null)}
                  className={`
                    rounded-full
                    border
                    px-4
                    py-2.5
                    ${
                      draftGenre === null
                        ? "border-[#B100CD] bg-[#F8E9FA]"
                        : "border-[#E5E1EE] bg-white"
                    }
                  `}
                >
                  <Text
                    className={`
                      text-sm
                      font-semibold
                      ${
                        draftGenre === null
                          ? "text-[#B100CD]"
                          : "text-[#777486]"
                      }
                    `}
                  >
                    Todos
                  </Text>
                </Pressable>

                {availableGenres.map((genre) => {
                  const selected = draftGenre === genre;

                  return (
                    <Pressable
                      key={genre}
                      onPress={() => setDraftGenre(selected ? null : genre)}
                      className={`
                          rounded-full
                          border
                          px-4
                          py-2.5
                          ${
                            selected
                              ? "border-[#B100CD] bg-[#F8E9FA]"
                              : "border-[#E5E1EE] bg-white"
                          }
                        `}
                    >
                      <Text
                        className={`
                            text-sm
                            font-semibold
                            ${selected ? "text-[#B100CD]" : "text-[#777486]"}
                          `}
                      >
                        {genre}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* AVALIAÇÃO */}

            <View className="mt-7">
              <Text className="mb-3 text-base font-bold text-[#201E2E]">
                Avaliação mínima
              </Text>

              <View className="flex-row gap-2">
                {[null, 3, 4, 5].map((rating) => {
                  const selected = draftRating === rating;

                  return (
                    <Pressable
                      key={rating ?? "any-rating"}
                      onPress={() => setDraftRating(rating)}
                      className={`
                          flex-1
                          items-center
                          justify-center
                          rounded-xl
                          border
                          py-3
                          ${
                            selected
                              ? "border-[#B100CD] bg-[#F8E9FA]"
                              : "border-[#E5E1EE] bg-white"
                          }
                        `}
                    >
                      {rating === null ? (
                        <Text
                          className={`
                              text-xs
                              font-semibold
                              ${selected ? "text-[#B100CD]" : "text-[#777486]"}
                            `}
                        >
                          Todas
                        </Text>
                      ) : (
                        <View className="flex-row items-center gap-1">
                          <Star
                            size={14}
                            color="#FFD700"
                            fill="#FFD700"
                            strokeWidth={1.8}
                          />

                          <Text
                            className={`
                                text-sm
                                font-bold
                                ${
                                  selected ? "text-[#B100CD]" : "text-[#777486]"
                                }
                              `}
                          >
                            {rating}+
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* AÇÕES */}

            <View className="mt-8 flex-row gap-3 border-t border-[#E5E1EE] pt-5">
              <Pressable
                onPress={clearDraftFilters}
                className="
                  h-12
                  flex-1
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[#E5E1EE]
                  bg-[#F8F7FB]
                "
              >
                <Text className="text-sm font-bold text-[#777486]">Limpar</Text>
              </Pressable>

              <Pressable
                onPress={applyFilters}
                className="
                  h-12
                  flex-1
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#B100CD]
                "
                style={{
                  shadowColor: "#B100CD",
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text className="text-sm font-bold text-white">
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
        onRequestClose={() => setIsSortModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-[#17152B]/60 md:items-center md:justify-center md:px-6">
          <View
            className="
              w-full
              rounded-t-[30px]
              bg-white
              p-6
              md:max-w-lg
              md:rounded-[30px]
            "
            style={{
              shadowColor: "#17152B",
              shadowOffset: {
                width: 0,
                height: 10,
              },
              shadowOpacity: 0.18,
              shadowRadius: 30,
              elevation: 15,
            }}
          >
            {/* CABEÇALHO */}

            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <View className="mb-2 flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-xl bg-[#F8E9FA]">
                    <ListFilter size={16} color="#B100CD" strokeWidth={2.3} />
                  </View>

                  <Text className="text-xl font-bold text-[#201E2E]">
                    Ordenar livros
                  </Text>
                </View>

                <Text className="text-sm leading-5 text-[#777486]">
                  Escolha como sua biblioteca será organizada.
                </Text>
              </View>

              <Pressable
                onPress={() => setIsSortModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Fechar ordenação"
                className="
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#E5E1EE]
                  bg-[#F8F7FB]
                "
              >
                <X size={18} color="#777486" strokeWidth={2.2} />
              </Pressable>
            </View>

            <View className="mt-6 h-px bg-[#E5E1EE]" />

            {/* OPÇÕES */}

            <View className="mt-5 gap-2">
              {sortOptions.map((option) => {
                const selected = sortOption === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setSortOption(option.value);

                      setIsSortModalVisible(false);
                    }}
                    className={`
                        min-h-[62px]
                        flex-row
                        items-center
                        justify-between
                        rounded-2xl
                        border
                        px-4
                        ${
                          selected
                            ? "border-[#B100CD] bg-[#F8E9FA]"
                            : "border-[#E5E1EE] bg-white"
                        }
                      `}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            ${selected ? "bg-white" : "bg-[#F8F7FB]"}
                          `}
                      >
                        {option.value === "alphabetical" ? (
                          <ArrowDownAZ size={18} color="#7057D9" />
                        ) : null}

                        {option.value === "alphabetical-reverse" ? (
                          <ArrowUpAZ size={18} color="#7057D9" />
                        ) : null}

                        {option.value === "recent" ? (
                          <CalendarArrowDown size={18} color="#7057D9" />
                        ) : null}

                        {option.value === "oldest" ? (
                          <CalendarArrowUp size={18} color="#7057D9" />
                        ) : null}

                        {option.value === "rating-high" ||
                        option.value === "rating-low" ? (
                          <Star
                            size={18}
                            color="#FFD700"
                            fill={selected ? "#FFD700" : "transparent"}
                            strokeWidth={1.8}
                          />
                        ) : null}
                      </View>

                      <View>
                        <Text
                          className={`
                              text-sm
                              font-bold
                              ${selected ? "text-[#B100CD]" : "text-[#201E2E]"}
                            `}
                        >
                          {option.label}
                        </Text>

                        <Text className="mt-0.5 text-xs text-[#9995A6]">
                          {option.description}
                        </Text>
                      </View>
                    </View>

                    <View
                      className={`
                          h-5
                          w-5
                          items-center
                          justify-center
                          rounded-full
                          border-2
                          ${selected ? "border-[#B100CD]" : "border-[#D8D4E2]"}
                        `}
                    >
                      {selected ? (
                        <View className="h-2.5 w-2.5 rounded-full bg-[#B100CD]" />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
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
                    <Trash2 size={23} color="#FF0000" strokeWidth={2} />
                  </View>
                </View>
              </View>

              {/* TÍTULO */}
              <Text className="mt-5 text-center text-2xl font-bold tracking-tight text-night-900">
                Excluir livro?
              </Text>

              {/* DESCRIÇÃO */}
              <Text className="mt-2 max-w-sm text-center text-sm leading-5 text-night-500">
                Essa ação removerá a obra da sua biblioteca e não poderá ser
                desfeita.
              </Text>

              {/* LIVRO */}
              <View className="mt-5 w-full rounded-2xl border border-lavender-200 bg-lavender-50 p-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-white">
                    <BookOpen size={18} color="#B100CD" strokeWidth={2} />
                  </View>

                  <View className="min-w-0 flex-1">
                    <Text
                      numberOfLines={2}
                      className="text-sm font-bold text-night-900"
                    >
                      {bookToDelete?.title}
                    </Text>

                    <Text
                      numberOfLines={1}
                      className="mt-0.5 text-xs text-night-500"
                    >
                      {bookToDelete?.author}
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
                  opacity: isDeleting ? 0.5 : pressed ? 0.72 : 1,
                  transform: [
                    {
                      scale: pressed && !isDeleting ? 0.985 : 1,
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
                  opacity: isDeleting ? 0.75 : pressed ? 0.88 : 1,
                  transform: [
                    {
                      scale: pressed && !isDeleting ? 0.985 : 1,
                    },
                  ],
                })}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Trash2 size={17} color="#FFFFFF" strokeWidth={2.2} />

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
    </Screen>
  );
}
