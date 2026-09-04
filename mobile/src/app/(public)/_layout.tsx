import { Redirect, Stack } from 'expo-router';

import { LoadingState } from '../../components/ui/feedback-state';
import { useAuth } from '../../hooks/use-auth';

export default function PublicLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
