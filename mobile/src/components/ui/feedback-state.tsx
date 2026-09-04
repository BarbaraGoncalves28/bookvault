import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from './button';

type FeedbackStateProps = {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function LoadingState({ message = 'Carregando...' }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-6">
      <ActivityIndicator color='#CA5CDD' size="large" />
      <Text className="text-base text-night-700">{message}</Text>
    </View>
  );
}

export function FeedbackState({ title, message, actionLabel, onAction }: FeedbackStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-6">
      <View className="items-center gap-2">
        <Text className="text-center text-xl font-bold text-ink-950">{title}</Text>
        {message ? <Text className="text-center text-base leading-6 text-ink-500">{message}</Text> : null}
      </View>
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
