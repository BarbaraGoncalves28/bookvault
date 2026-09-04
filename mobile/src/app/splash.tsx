import { Redirect } from 'expo-router';

import { LoadingState } from '../components/ui/feedback-state';
import { useAuth } from '../hooks/use-auth';

export default function SplashRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Preparando sua biblioteca..." />;
  }

  return <Redirect href={isAuthenticated ? '/home' : '/login'} />;
}
