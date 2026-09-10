import type {
  TextInputProps,
  TextStyle,
} from 'react-native';
import {
  Text,
  TextInput,
  View,
} from 'react-native';

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
  multiline,
  ...props
}: BookFormInputProps) {
  const multilineStyle: TextStyle | undefined =
    multiline
      ? {
          height: 144,
          minHeight: 144,
          textAlignVertical: 'top',
        }
      : undefined;

  return (
    <View className="gap-2">
      <Text className="text-sm font-bold text-night-900">
        {label}:
      </Text>

      <View
        className={cn(
          'overflow-hidden rounded-2xl border',
          multiline
            ? 'h-[144px]'
            : 'min-h-12',
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
          multiline={multiline}
          className={cn(
            'book-form-input w-full px-4 text-base',
            multiline
              ? 'h-[144px] py-3'
              : 'h-12',
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
            multilineStyle,
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
