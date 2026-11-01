import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';
import { mithrilApiEnvironment } from '@/lib/mithril/config';
import { isSentryEnabled, sentryDsn } from './config';

function sentryEnvironment(): string {
  if (__DEV__) return 'development';
  const mithril = mithrilApiEnvironment();
  if (mithril === 'production') return 'production';
  if (mithril === 'staging') return 'staging';
  return mithril;
}

function sentryRelease(): string | undefined {
  const version = Constants.expoConfig?.version ?? Constants.nativeAppVersion;
  const build =
    Constants.nativeBuildVersion ??
    (Platform.OS === 'android'
      ? Constants.expoConfig?.android?.versionCode
      : Constants.expoConfig?.ios?.buildNumber);
  const slug = Constants.expoConfig?.slug ?? 'instaclean-direct-mobile';
  if (!version) return undefined;
  const base = `${slug}@${version}`;
  return build != null && String(build).length > 0 ? `${base}+${build}` : base;
}

let initialized = false;

/** Call once before the root layout renders. */
export function initSentry(): void {
  if (initialized) return;
  initialized = true;

  const dsn = sentryDsn();
  if (!dsn) {
    if (__DEV__) {
      console.warn('[Sentry] EXPO_PUBLIC_SENTRY_DSN is not set; crash reporting disabled.');
    }
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: sentryEnvironment(),
      release: sentryRelease(),
      dist: Constants.nativeBuildVersion ?? undefined,
      sendDefaultPii: false,
      enableAutoSessionTracking: true,
      tracesSampleRate: __DEV__ ? 0.2 : 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[Sentry] init skipped:', (error as Error).message);
    }
  }
}

export { Sentry };
