import { initSentry, Sentry } from '@/lib/sentry';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { theme } from '@/constants/theme';
import { reportError, shouldReportErrorToSentry } from '@/lib/sentry';

initSentry();

function reportQueryError(error: unknown, kind: 'query' | 'mutation', key: unknown) {
  if (!shouldReportErrorToSentry(error)) return;
  reportError(error, {
    action: 'react_query',
    tags: { domain: 'react_query', kind },
    extra: { key: JSON.stringify(key) },
  });
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => reportQueryError(error, 'query', query.queryKey),
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) =>
      reportQueryError(error, 'mutation', mutation.options.mutationKey ?? []),
  }),
  defaultOptions: {
    queries: { retry: 1, staleTime: 20_000 },
  },
});

export { ErrorBoundary } from '@sentry/react-native';

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isReady } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    const inAuth = segments[0] === 'sign-in';
    if (!isSignedIn && !inAuth) {
      router.replace('/sign-in');
    } else if (isSignedIn && inAuth) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isReady, segments, router]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  return children;
}

function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="light" />
        <AuthGate>
          <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
            animation: 'slide_from_right',
          }}>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="services/index" />
          <Stack.Screen name="services/[id]" />
          <Stack.Screen name="promo-codes" />
          <Stack.Screen name="service-areas" />
          <Stack.Screen name="reports" />
          <Stack.Screen name="payouts" />
          <Stack.Screen name="billing/index" />
          <Stack.Screen name="finance/loans" />
          <Stack.Screen name="reviews" />
          <Stack.Screen name="team" />
          <Stack.Screen name="customers" />
          <Stack.Screen name="customer-trust" />
          <Stack.Screen name="worker-health" />
          <Stack.Screen name="placements" />
          <Stack.Screen name="concierge" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="users/merge" />
          <Stack.Screen name="assisted-booking" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="dispatch-map" />
          <Stack.Screen name="workers/index" />
          <Stack.Screen name="workers/[userId]" />
          <Stack.Screen name="workers/applications/[id]" />
          <Stack.Screen name="workers/drafts/[id]" />
          <Stack.Screen name="contracts/index" />
          <Stack.Screen name="contracts/[id]" />
          <Stack.Screen name="bookings/[id]/index" />
          <Stack.Screen name="bookings/[id]/invoice" />
          <Stack.Screen name="service-requests/[id]" />
          <Stack.Screen name="whatsapp/index" />
          <Stack.Screen name="whatsapp/[phone]" />
          <Stack.Screen name="placements/[id]" />
          <Stack.Screen name="customer-trust/[customerId]" />
          <Stack.Screen name="worker-health/[id]" />
          <Stack.Screen name="app-update-policy" />
          </Stack>
        </AuthGate>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
