import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  NotebookPen,
  FilePenLine,
} from 'lucide-react-native';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { BookForm } from '../../components/books/book-form';
import { Breadcrumb } from '../../components/layout/breadcrumb';
import { Screen } from '../../components/layout/screen';
import { BackButton } from '@/components/layout/back-button';

import {
  FeedbackState,
  LoadingState,
} from '../../components/ui/feedback-state';

import { booksService } from '../../services/books-service';
import { toApiError } from '../../services/api';

import type {
  Book,
  BookPayload,
} from '../../types/book';

type BookFormScreenProps = {
  mode: 'create' | 'edit';
};

export function BookFormScreen({
  mode,
}: BookFormScreenProps) {
  const { id } =
    useLocalSearchParams<{ id: string }>();

  const [book, setBook] = useState<Book | undefined>();
  const [error, setError] = useState<string | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(
    mode === 'edit',
  );

  const isEditMode = mode === 'edit';

  const pageTitle = isEditMode
    ? 'Editar livro'
    : 'Novo livro';

  const pageDescription = isEditMode
    ? 'Atualize as informações da obra e mantenha sua biblioteca em ordem.'
    : 'Adicione uma nova obra à sua biblioteca pessoal.';

  const loadBook = useCallback(async () => {
    if (!isEditMode || !id) {
      return;
    }

    try {
      setBook(
        await booksService.findById(id),
      );
    } catch {
      setError(
        'Não foi possível carregar o livro para edição.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    void loadBook();
  }, [loadBook]);

  async function handleSubmit(
    payload: BookPayload,
  ) {
    try {
      const savedBook =
        isEditMode && id
          ? await booksService.update(
              id,
              payload,
            )
          : await booksService.create(
              payload,
            );

      Toast.show({
        type: 'success',
        text1: isEditMode
          ? 'Livro atualizado'
          : 'Livro criado',
        text2: isEditMode
          ? 'As alterações foram salvas com sucesso.'
          : 'O livro foi adicionado à sua biblioteca.',
        position: 'top',
        visibilityTime: 2500,
      });

      router.replace(
        `/livros/${savedBook.id}`,
      );
    } catch (err) {
      const apiError = toApiError(err);

      Toast.show({
        type: 'error',
        text1: isEditMode
          ? 'Erro ao atualizar livro'
          : 'Erro ao criar livro',
        text2: apiError.message,
        position: 'top',
        visibilityTime: 3500,
      });

      throw apiError;
    }
  }

  if (isLoading) {
    return (
      <Screen className="flex-1 min-h-0">
        <View className="flex-1 items-center justify-center">
          <LoadingState message="Carregando livro..." />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-5">
          <FeedbackState
            title="Não foi possível continuar"
            message={error}
            actionLabel="Voltar"
            onAction={() =>
              router.back()
            }
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      {/* BREADCRUMB */}
      <Breadcrumb
        current={pageTitle}
      />

      {/* VOLTAR */}
      <View className="mb-5">
        <BackButton />
      </View>

      {/* CABEÇALHO */}
      <View className="mb-7 flex-row items-start gap-3 md:gap-4">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
          {isEditMode ? (
            <FilePenLine
              size={23}
              color="#B100CD"
              strokeWidth={2}
            />
          ) : (
            <NotebookPen
              size={23}
              color="#B100CD"
              strokeWidth={2}
            />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-2xl font-bold text-night-900 md:text-3xl">
            {pageTitle}
          </Text>

          <Text className="mt-1 text-sm text-night-500 md:text-base">
            {pageDescription}
          </Text>
        </View>
      </View>

      {/* FORMULÁRIO */}
      <BookForm
        initialBook={book}
        submitLabel={
          isEditMode
            ? 'Salvar alterações'
            : 'Criar livro'
        }
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}