import {
  BookOpen,
  Check,
  Pencil,
  LibraryBig,
  Target,
  X,
} from 'lucide-react-native';
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
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
  icon: typeof BookOpen;
  description: string;
}

function Progress({
  title,
  current,
  total,
  onEdit,
  icon: Icon,
  description,
}: ProgressProps) {
  const percentage =
    total > 0
      ? Math.min(Math.round((current / total) * 100), 100)
      : 0;

  return (
    <View className="mt-5">
      {/* CABEÇALHO */}
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
          <Icon
            size={17}
            color="#B100CD"
            strokeWidth={2}
          />
        </View>

        <View className="min-w-0 flex-1">
          <ProgressLabelPerfil>
            {title}
          </ProgressLabelPerfil>

          <Text
            numberOfLines={1}
            className="mt-0.5 text-[11px] text-night-400"
          >
            {description}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-bold text-brand-500">
            {percentage}%
          </Text>

          {onEdit ? (
            <Pressable
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel="Editar meta do ano"
              hitSlop={5}
              style={({ pressed }) => ({
                opacity: pressed ? 0.65 : 1,
                transform: [
                  {
                    scale: pressed ? 0.96 : 1,
                  },
                ],
              })}
              className="
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                border
                border-lavender-200
                bg-white
              "
            >
              <Pencil
                size={14}
                color='#CA5CDD'
                strokeWidth={2}
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* PROGRESSO */}
      <View className="ml-12 mt-3">
        <View className="h-2 overflow-hidden rounded-full bg-lavender-100">
          <View
            className="h-full rounded-full bg-brand-500"
            style={{
              width: `${percentage}%`,
            }}
          />
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-xs font-medium text-night-500">
            {current.toLocaleString('pt-BR')}
          </Text>

          <Text className="text-xs text-night-400">
            de {total.toLocaleString('pt-BR')}
          </Text>
        </View>
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
      {/* CARD PRINCIPAL */}
      <View
        className="
          h-auto
          overflow-hidden
          rounded-[28px]
          border
          border-lavender-200
          bg-white
          p-5
          shadow-soft
          md:h-[405px]
          md:p-6
        "
      >
        {/* CABEÇALHO */}
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
            <LibraryBig
              size={19}
              color="#B100CD"
              strokeWidth={2}
            />
          </View>

          <View className="flex-1">
            <Text className="text-xl font-bold text-night-900">
              Minha biblioteca
            </Text>

            <Text className="mt-0.5 text-sm text-night-500">
              Acompanhe sua evolução de leitura.
            </Text>
          </View>
        </View>

        {/* PROGRESSOS */}
        <Progress
          title="Páginas lidas"
          description="Progresso geral da biblioteca"
          current={pagesRead}
          total={totalPages}
          icon={BookOpen}
        />

        <Progress
          title="Meta do ano"
          description="Livros concluídos neste ano"
          current={yearlyCompletedBooks}
          total={annualReadingGoal}
          icon={Target}
          onEdit={openGoalModal}
        />

        <Progress
          title="Livros lidos"
          description="Obras concluídas na biblioteca"
          current={completedBooks}
          total={totalBooks}
          icon={Check}
        />
      </View>

      {/* MODAL DA META */}
      <Modal
        visible={goalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeGoalModal}
      >
        <View className="flex-1 items-center justify-center bg-[#17152B]/70 px-5">
          <View
            className="
              w-full
              max-w-md
              overflow-hidden
              rounded-[28px]
              border
              border-lavender-200
              bg-white
              p-6
              shadow-soft
              md:p-7
            "
          >
            {/* CABEÇALHO */}
            <View className="flex-row items-start gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
                <Target
                  size={21}
                  color="#B100CD"
                  strokeWidth={2}
                />
              </View>

              <View className="min-w-0 flex-1">
                <Text className="text-xl font-bold text-night-900">
                  Meta de leitura
                </Text>

                <Text className="mt-1 text-sm leading-5 text-night-500">
                  Defina quantos livros você quer ler neste ano.
                </Text>
              </View>

              <Pressable
                onPress={closeGoalModal}
                disabled={savingGoal}
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                hitSlop={5}
                className="
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-lavender-200
                  bg-white
                "
              >
                <X
                  size={17}
                  color="#777486"
                  strokeWidth={2}
                />
              </Pressable>
            </View>

            {/* META ATUAL */}
            <View className="mt-6 rounded-2xl border border-lavender-200 bg-lavender-50 p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs font-medium text-night-500">
                    Meta atual
                  </Text>

                  <Text className="mt-1 text-2xl font-bold text-night-900">
                    {annualReadingGoal}
                  </Text>
                </View>

                <View className="h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <BookOpen
                    size={18}
                    color="#B100CD"
                    strokeWidth={2}
                  />
                </View>
              </View>
            </View>

            {/* CAMPO */}
            <View className="mt-5">
              <Text className="mb-2.5 text-sm font-bold text-night-900">
                Nova meta
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
                className="
                  h-12
                  rounded-xl
                  border
                  border-lavender-200
                  bg-white
                  px-4
                  text-base
                  text-night-900
                "
              />

              {goalError ? (
                <View className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                  <Text className="text-sm font-medium leading-5 text-red-600">
                    {goalError}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* AÇÕES */}
            <View className="mt-6 flex-row gap-3">
              <Pressable
                onPress={closeGoalModal}
                disabled={savingGoal}
                accessibilityRole="button"
                className="
                  h-12
                  flex-1
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-lavender-200
                  bg-white
                "
              >
                <Text className="text-sm font-bold text-night-700">
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={() => void handleSaveGoal()}
                disabled={savingGoal}
                accessibilityRole="button"
                className="
                  h-12
                  flex-1
                  items-center
                  justify-center
                  rounded-xl
                  bg-brand-500
                "
              >
                <Text className="text-sm font-bold text-white">
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