import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { cn } from '../../utils/cn';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
};

const variants = {
  primary: 'bg-brand-500',
  secondary: 'border border-slate-200 bg-white',
  ghost: 'bg-transparent',
  danger: 'bg-[#FF0000]',
};

const textVariants = {
  primary: 'text-white',
  secondary: 'text-ink-900',
  ghost: 'text-brand-700',
  danger: 'text-white',
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  icon,
  className,
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      className={cn(
        'min-h-12 flex-row items-center justify-center gap-2 rounded-control px-4',
        variants[variant],
        isDisabled && 'opacity-60',
        className,
      )}
    >
      {isLoading ? <ActivityIndicator color={variant === 'secondary' ? '#0f172a' : '#ffffff'} /> : icon}
      <Text className={cn('whitespace-nowrap text-base font-semibold', textVariants[variant])}>{title}</Text>
    </Pressable>
  );
}
