import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Sentry } from '@/lib/sentry';
import {
  authErrorMessage,
  clearStoredTokens,
  fetchMe,
  isStaffUser,
  loginWithPassword,
  MithrilApiError,
  persistSession,
  requestPhoneOtp,
  restoreSession,
  signOutSession,
  setSessionListener,
  verifyPhoneOtp,
  type MithrilUser,
} from '@/lib/mithril';

type AuthContextValue = {
  isReady: boolean;
  isSignedIn: boolean;
  user: MithrilUser | null;
  accessToken: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<MithrilUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const restored = await restoreSession();
        if (!cancelled && restored) {
          setUser(restored.user);
          setAccessToken(restored.accessToken);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSessionListener((token) => {
      setAccessToken(token);
      if (!token) setUser(null);
    });
    return () => setSessionListener(null);
  }, []);

  useEffect(() => {
    if (user?.id) {
      Sentry.setUser({ id: user.id, email: user.email ?? undefined });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);

  const applySession = useCallback(async (session: Awaited<ReturnType<typeof loginWithPassword>>) => {
    await persistSession(session);
    const me = await fetchMe(session.access_token);
    if (!isStaffUser(me)) {
      await clearStoredTokens();
      throw new MithrilApiError(403, 'forbidden', 'Admin access required');
    }
    setUser(me);
    setAccessToken(session.access_token);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const session = await loginWithPassword(email, password);
      await applySession(session);
    } catch (error) {
      if (error instanceof MithrilApiError) {
        throw new Error(authErrorMessage(error.code));
      }
      throw new Error(authErrorMessage('login_failed'));
    }
  }, [applySession]);

  const requestOtp = useCallback(async (phone: string) => {
    try {
      await requestPhoneOtp(phone);
    } catch (error) {
      if (error instanceof MithrilApiError) {
        throw new Error(authErrorMessage(error.code));
      }
      throw new Error('Could not send verification code.');
    }
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, code: string) => {
      try {
        const session = await verifyPhoneOtp(phone, code);
        await applySession(session);
      } catch (error) {
        if (error instanceof MithrilApiError) {
          throw new Error(authErrorMessage(error.code));
        }
        throw new Error('Could not verify code.');
      }
    },
    [applySession],
  );

  const signOut = useCallback(async () => {
    await signOutSession();
    setUser(null);
    setAccessToken(null);
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      isSignedIn: Boolean(user && accessToken),
      user,
      accessToken,
      signInWithEmail,
      requestOtp,
      verifyOtp,
      signOut,
    }),
    [isReady, user, accessToken, signInWithEmail, requestOtp, verifyOtp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
