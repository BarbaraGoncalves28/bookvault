import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '../../utils/cn';

type ScreenProps = {
  children: ReactNode;
  className?: string;
  scroll?: boolean;
};

export function Screen({
  children,
  className,
  scroll = false,
}: ScreenProps) {
  const content = (
    <View
      className={cn(
        'mx-auto w-full max-w-6xl min-w-0 px-4 py-6 md:px-8 lg:px-10',
        className,
      )}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView className="min-w-0 flex-1 bg-[#FAF9FC]">
      {scroll ? (
        <ScrollView
          className="min-w-0 flex-1 bg-[#FAF9FC]"
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}