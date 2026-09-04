import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Pencil, X } from 'lucide-react-native';
import { useState } from 'react';

import { ProgressLabelPerfil } from '../ui/progress-label-perfil';
import { usersService } from '../../services/users-service';

interface ProfileStatsProps {
  totalBooks: number;
  completedBooks: number;

  pagesRead: number;
  totalPages: number;

  yearlyCompletedBooks: number;
  annualReadingGoal: number;

  onReadingGoalUpdated: () => Promise<void>;
}

interface ProgressProps {
  title: string;
  current: number;
  total: number;
  onEdit?: () => void;
}

function Progress({
  title,
  current,
  total,
  onEdit,
}: ProgressProps) {
  const percentage =
    total > 0
      ? Math.min(Math.round((current / total) * 100), 100)
      : 0;

  return (
    <View className="mt-5">
      <View className="flex-row items-center justify-between">
        <ProgressLabelPerfil>
          {title}
        </ProgressLabelPerfil>

        <View className="flex-row items-center gap-3">
          <Text className="text-sm font-bold text-brand-700">
            {percentage}%
          </Text>

          {onEdit ? (
            <Pressable
              onPress={onEdit}
              accessibilityLabel="Editar meta do ano"
              className="h-8 w-8 items-center justify-center rounded-lg bg-lavender-100"
            >
              <Pencil
                size={15}
                color="#7057D9"
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View className="mt-2 h-2 overflow-hidden rounded-full bg-lavender-100">
        <View
          className="h-full rounded-full bg-brand-700"
          style={{
            width: `${percentage}%`,
          }}
        />
      </View>

      <View className="mt-2 flex-row justify-between">
        <Text className="text-xs text-night-500">
          {current.toLocaleString('pt-BR')}
        </Text>

        <Text className="text-xs text-night-500">
          {total.toLocaleString('pt-BR')}
        </Text>
      </View>
    </View>
  );
}

export function ProfileStats({
  totalBooks,
  completedBooks,
  pagesRead,
  totalPages,
  yearlyCompletedBooks,
  annualReadingGoal,
  onReadingGoalUpdated,
}: ProfileStatsProps) {
  const [goalModalVisible, setGoalModalVisible] =
    useState(false);

  const [goalInput, setGoalInput] = useState(
    String(annualReadingGoal),
  );

  const [goalError, setGoalError] = useState('');

  const [savingGoal, setSavingGoal] =
    useState(false);

  function openGoalModal() {
    setGoalInput(String(annualReadingGoal));
    setGoalError('');
    setGoalModalVisible(true);
  }

  function closeGoalModal() {
    if (savingGoal) {
      return;
    }

    setGoalModalVisible(false);
    setGoalError('');
  }

  async function handleSaveGoal() {
    const trimmedGoal = goalInput.trim();

    if (!trimmedGoal) {
      setGoalError('Informe uma meta.');
      return;
    }

    const goal = Number(trimmedGoal);

    if (!Number.isInteger(goal)) {
      setGoalError(
        'A meta deve ser um número inteiro.',
      );
      return;
    }

    if (goal < 1) {
      setGoalError(
        'A meta deve ser de pelo menos 1 livro.',
      );
      return;
    }

    if (goal > 1000) {
      setGoalError(
        'A meta não pode ultrapassar 1000 livros.',
      );
      return;
    }

    try {
      setSavingGoal(true);
      setGoalError('');

      await usersService.updateReadingGoal(goal);

      await onReadingGoalUpdated();

      setGoalModalVisible(false);
    } catch {
      setGoalError(
        'Não foi possível atualizar sua meta. Tente novamente.',
      );
    } finally {
      setSavingGoal(false);
    }
  }

  return (
    <>
      <View className="h-auto rounded-2xl border border-brand-500 bg-white p-5 md:h-[335px]">
        <Text className="text-xl font-bold text-night-900">
          Minha biblioteca
        </Text>

        {/* PÁGINAS LIDAS */}
        <Progress
          title="Páginas lidas"
          current={pagesRead}
          total={totalPages}
        />

        {/* METAS DO ANO */}
        <Progress
          title="Metas do ano"
          current={yearlyCompletedBooks}
          total={annualReadingGoal}
          onEdit={openGoalModal}
        />

        {/* LIVROS LIDOS */}
        <Progress
          title="Livros lidos"
          current={completedBooks}
          total={totalBooks}
        />
      </View>

      <Modal
        visible={goalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeGoalModal}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-md rounded-3xl bg-white p-6">
            {/* CABEÇALHO */}
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-xl font-bold text-night-900">
                  Meta de leitura
                </Text>

                <Text className="mt-1 text-sm text-night-500">
                  Defina quantos livros você quer ler neste ano.
                </Text>
              </View>

              <Pressable
                onPress={closeGoalModal}
                disabled={savingGoal}
                className="h-9 w-9 items-center justify-center rounded-full bg-lavender-100"
              >
                <X
                  size={18}
                  color="#777486"
                />
              </Pressable>
            </View>

            {/* CAMPO */}
            <View className="mt-6">
              <Text className="mb-3 text-base font-bold text-night-900">
                Quantidade de livros:
              </Text>

              <TextInput
                value={goalInput}
                onChangeText={(value) => {
                  setGoalInput(
                    value.replace(/[^0-9]/g, ''),
                  );

                  if (goalError) {
                    setGoalError('');
                  }
                }}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={4}
                placeholder="Ex.: 30"
                placeholderTextColor="#8A8795"
                editable={!savingGoal}
                className="h-12 rounded-xl border border-lavender-200 bg-lavender-50 px-4 text-base text-night-900"
              />

              {goalError ? (
                <Text className="mt-2 text-sm font-medium text-red-500">
                  {goalError}
                </Text>
              ) : null}
            </View>

            {/* AÇÕES */}
            <View className="mt-6 flex-row gap-3">
              <Pressable
                onPress={closeGoalModal}
                disabled={savingGoal}
                className="h-12 flex-1 items-center justify-center rounded-xl bg-night-100"
              >
                <Text className="font-semibold text-night-700">
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={() => void handleSaveGoal()}
                disabled={savingGoal}
                className="h-12 flex-1 items-center justify-center rounded-xl bg-brand-500"
              >
                <Text className="font-semibold text-white">
                  {savingGoal
                    ? 'Salvando...'
                    : 'Salvar meta'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}