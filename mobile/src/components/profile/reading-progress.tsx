import { Text, View } from 'react-native';

interface ReadingProgressProps {
  readBooks: number;
  totalBooks: number;
}

export function ReadingProgress({
  readBooks,
  totalBooks,
}: ReadingProgressProps) {
  const progress =
    totalBooks > 0
      ? Math.min(readBooks / totalBooks, 1)
      : 0;

  const percentage = Math.round(progress * 100);

  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-ink-950">
          Progresso de leitura
        </Text>

        <Text className="font-bold text-emerald-600">
          {percentage}%
        </Text>
      </View>

      <Text className="mt-2 text-sm text-ink-500">
        {totalBooks === 0
          ? 'Você ainda não possui livros cadastrados.'
          : `Você leu ${readBooks} de ${totalBooks} livros.`}
      </Text>

      <View className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <View
          className="h-full rounded-full bg-emerald-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </View>
    </View>
  );
}