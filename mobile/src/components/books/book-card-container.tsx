import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '../../utils/cn';

type BookCardContainerProps = {
  children: ReactNode;
  className?: string;
};

export function BookCardContainer({
  children,
  className,
}: BookCardContainerProps) {
  return (
    <View
      className={cn(
        'rounded-card border border-brand-300 p-4 shadow-soft',
        className,
      )}
    >
      {children}
    </View>
  );
}