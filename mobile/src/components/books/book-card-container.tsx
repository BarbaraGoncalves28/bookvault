import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { cn } from '../../utils/cn';

type BookCardContainerProps = {
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
}; 

export function BookCardContainer({
  children,
  className, 
  style,
}: BookCardContainerProps) {
  return (
    <View
      className={cn(
        'rounded-card border border-brand-300 p-4 shadow-soft',
        className,
      )}
      style={style}
    >
      {children}
    </View>
  );
}