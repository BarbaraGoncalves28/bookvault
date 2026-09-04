import { Text } from 'react-native';

type ProgressLabelProps = {
  children: string;
};

export function ProgressLabelPerfil({
  children,
}: ProgressLabelProps) {
  return (
    <Text className="flex-1 text-sm font-semibold text-night-700">
      {children}
    </Text>
  );
}