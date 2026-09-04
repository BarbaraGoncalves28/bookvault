import type { TextInputProps } from 'react-native';
import { Text, TextInput, View, Pressable } from 'react-native';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import {
  Eye,
  EyeOff,
  type LucideIcon,
} from 'lucide-react-native';

type TextInputFieldProps = TextInputProps & {
  label: string;
  error?: string;
  icon?: LucideIcon;
};

export function TextInputField({
  label,
  error,
  icon: Icon,
  className,
  style,
  secureTextEntry,
  ...props
}: TextInputFieldProps) {

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPasswordField = secureTextEntry === true;
  
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-night-900">
        {label}
      </Text>

      <View
        className={cn(
          'min-h-12 flex-row items-center overflow-hidden rounded-2xl',
          error && 'border-red-400/70',
        )}
        style={{
          backgroundColor: 'rgba(23, 21, 43, 0.25)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.55)',
        }}
      >
        {Icon ? (
          <View className="ml-4 mr-1 items-center justify-center">
            <Icon
              size={19}
              color='#8A00C2'
              strokeWidth={2}
            />
          </View>
        ) : null}

        <TextInput
          {...props}
          secureTextEntry={
            isPasswordField
              ? !isPasswordVisible
              : false
          }
          className={cn(
            'glass-input min-h-12 flex-1 px-4 text-base',
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
        />

        {isPasswordField ? (
          <Pressable
            onPress={() =>
              setIsPasswordVisible((visible) => !visible)
            }
            className="mr-4 items-center justify-center"
            hitSlop={10}
          >
            {isPasswordVisible ? (
              <EyeOff
                size={19}
                color="#8A00C2"
                strokeWidth={2}
              />
            ) : (
              <Eye
                size={19}
                color="#8A00C2"
                strokeWidth={2}
              />
            )}
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text className="text-sm text-red-300">
          {error}
        </Text>
      ) : null}
    </View>
  );
}