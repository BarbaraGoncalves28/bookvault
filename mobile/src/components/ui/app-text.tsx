import type { TextProps } from 'react-native';
import { Text } from 'react-native';

import { cn } from '../../utils/cn';

type AppTextProps = TextProps & {
  variant?: 'display' | 'title' | 'heading' | 'body' | 'caption' | 'label';
};

const variants = {
  display: 'text-4xl font-bold text-ink-950 md:text-5xl',
  title: 'text-3xl font-bold text-ink-950',
  heading: 'text-xl font-bold text-ink-900',
  body: 'text-base leading-6 text-ink-700',
  caption: 'text-sm leading-5 text-ink-500',
  label: 'text-sm font-semibold text-ink-700',
} as const;

export function AppText({ variant = 'body', className, ...props }: AppTextProps) {
  return <Text className={cn(variants[variant], className)} {...props} />;
}
