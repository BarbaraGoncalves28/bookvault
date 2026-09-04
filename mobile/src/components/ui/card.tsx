import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '../../utils/cn';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-card border border-brand-500 bg-white p-4 shadow-soft',
        className,
      )}
    >
      {children}
    </View>
  );
}