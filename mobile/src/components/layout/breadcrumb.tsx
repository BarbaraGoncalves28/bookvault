import { Text, View } from 'react-native';

type BreadcrumbProps = {
  current: string;
  parent?: string;
};

export function Breadcrumb({ current, parent }: BreadcrumbProps) {
  return (
    <View className="mb-5 flex-row items-center gap-2">
      <Text className="text-sm font-semibold text-brand-500">
        BookVault
      </Text>

      <Text className="text-sm text-night-500">›</Text>

      {parent ? (
        <>
          <Text className="text-sm font-medium text-night-500">
            {parent}
          </Text>

          <Text className="text-sm text-night-500">›</Text>
        </>
      ) : null}

      <Text className="text-sm font-semibold text-night-500">
        {current}
      </Text>
    </View>
  );
}