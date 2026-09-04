import { Text, View } from 'react-native';

type BadgeProps = {
  label: string;
  tone?: 'neutral' | 'brand' | 'warning';
};

const toneClasses = {
  neutral: 'bg-slate-100 text-ink-700',
  brand: 'bg-brand-100 text-brand-900',
  warning: 'bg-amber-100 text-amber-800',
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const [bg, text] = toneClasses[tone].split(' ');

  return (
    <View className={`self-start rounded-full px-3 py-1 ${bg}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
