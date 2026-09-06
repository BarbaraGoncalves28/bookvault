import { ChevronRight, Library } from 'lucide-react-native';
import { Text, View } from 'react-native';

type BreadcrumbProps = {
  current: string;
  parent?: string;
};

export function Breadcrumb({ current, parent }: BreadcrumbProps) {
  return (
    <View className="mb-6 self-start">
      <View className="flex-row items-center rounded-full border border-lavender-200 bg-white px-3 py-2">
        {/* Brand */}
        <View className="flex-row items-center">
          <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-brand-50">
            <Library size={14} color="#B100CD" strokeWidth={2.2} />
          </View>

          <Text className="text-sm font-bold text-brand-500">
            BookVault
          </Text>
        </View>

        {/* Separator */}
        <ChevronRight
          size={15}
          color="#777486"
          strokeWidth={1.8}
          style={{ marginHorizontal: 7 }}
        />

        {/* Parent */}
        {parent ? (
          <>
            <Text
              numberOfLines={1}
              className="max-w-[180px] text-sm font-medium text-night-500"
            >
              {parent}
            </Text>

            <ChevronRight
              size={15}
              color="#777486"
              strokeWidth={1.8}
              style={{ marginHorizontal: 7 }}
            />
          </>
        ) : null}

        {/* Current */}
        <Text
          numberOfLines={1}
          className="max-w-[220px] text-sm font-semibold text-night-900"
        >
          {current}
        </Text>
      </View>
    </View>
  );
}