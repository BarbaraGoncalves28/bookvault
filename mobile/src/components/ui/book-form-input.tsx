import type { TextInputProps } from 'react-native';
import { Text, TextInput, View } from 'react-native';
import { cn } from '../../utils/cn';

type BookFormInputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function BookFormInput({
  label,
  error,
  className,
  style,
  ...props
}: BookFormInputProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-bold text-night-900">
        {label}:
      </Text>

      <View
        className={cn(
          'min-h-12 overflow-hidden rounded-2xl border',
          error
            ? 'border-red-400'
            : 'border-lavender-200',
        )}
        style={{
          backgroundColor: '#FAF9FC',
        }}
      >
        <TextInput
          {...props}
          className={cn(
            'book-form-input min-h-12 flex-1 px-4 text-base',
            className,
          )}
          style={[
            {
              backgroundColor: 'transparent',
              borderWidth: 0,
              borderColor: 'transparent',
              outlineWidth: 0,
              color: '#201E2E',
              boxShadow: 'none',
            },
            style,
          ]}
          placeholderTextColor="#9995A6"
        />
      </View>

      {error ? (
        <Text className="text-sm text-red-400">
          {error}
        </Text>
      ) : null}
    </View>
  );
}