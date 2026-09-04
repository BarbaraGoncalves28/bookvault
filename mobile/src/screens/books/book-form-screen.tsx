import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { BookForm } from '../../components/books/book-form';
import { Breadcrumb } from '../../components/layout/breadcrumb';
import { Screen } from '../../components/layout/screen';
import {
  FeedbackState,
  LoadingState,
} from '../../components/ui/feedback-state';
import { booksService } from '../../services/books-service';
import { toApiError } from '../../services/api';
import type { Book, BookPayload } from '../../types/book';
import { BackButton } from '@/components/layout/back-button';

type BookFormScreenProps = {
  mode: 'create' | 'edit';
};

export function BookFormScreen({ mode }: BookFormScreenProps) {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [book, setBook] = useState<Book | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(mode === 'edit');

  const loadBook = useCallback(async () => {
    if (mode !== 'edit' || !id) {
      return;
    }

    try {
      setBook(await booksService.findById(id));
    } catch {
      setError('Não foi possível carregar o livro para edição.');
    } finally {
      setIsLoading(false);
    }
  }, [id, mode]);

  useEffect(() => {
    void loadBook();
  }, [loadBook]);

  async function handleSubmit(payload: BookPayload) {
    try {
      const savedBook =
        mode === 'edit' && id
          ? await booksService.update(id, payload)
          : await booksService.create(payload);

      Toast.show({
        type: 'success',
        text1: mode === 'edit' ? 'Livro atualizado' : 'Livro criado',
        text2:
          mode === 'edit'
            ? 'As alterações foram salvas com sucesso.'
            : 'O livro foi adicionado à sua biblioteca.',
        position: 'top',
        visibilityTime: 2500,
      });

      router.replace(`/livros/${savedBook.id}`);
    } catch (err) {
      const apiError = toApiError(err);

      Toast.show({
        type: 'error',
        text1:
          mode === 'edit'
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
      <Screen>
        <View className="min-h-screen flex-1 items-center justify-center">
          <LoadingState message="Carregando livro..." />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <FeedbackState
            title="Não foi possível continuar"
            message={error}
            actionLabel="Voltar"
            onAction={() => router.back()}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      {/* BREADCRUMB */}
      <Breadcrumb
        current={mode === 'edit' ? 'Editar livro' : 'Novo livro'}
      />

      <BackButton />

      {/* CABEÇALHO */}
      <View className="mb-5 gap-2">
        <Text className="text-3xl font-bold text-[#F2F0FA]">
          {mode === 'edit' ? 'Editar livro' : 'Novo livro'}
        </Text>

        <Text className="text-sm text-night-500">
          {mode === 'edit'
            ? 'Atualize as informações do seu livro.'
            : 'Preencha as informações para adicionar um livro à sua coleção.'}
        </Text>
      </View>

      {/* FORMULÁRIO */}
      <BookForm
        initialBook={book}
        submitLabel={
          mode === 'edit' ? 'Salvar alterações' : 'Criar livro'
        }
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}