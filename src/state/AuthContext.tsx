import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { isFirebaseConfigured } from '../config/firebase';
import { getAuthErrorMessage } from '../services/auth/errors';
import type { AuthService, AuthServiceLoader, EcoRutaAuthUser, RegisterInput, RegisterResult } from '../services/auth/types';

interface AuthContextValue {
  configured: boolean;
  ready: boolean;
  user: EcoRutaAuthUser | null;
  initializationError: string;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  signIn: (email: string, password: string) => Promise<EcoRutaAuthUser>;
  resendEmailVerification: () => Promise<void>;
  refreshUser: () => Promise<EcoRutaAuthUser | null>;
  getIdToken: () => Promise<string>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const defaultLoader: AuthServiceLoader = async () => {
  const module = await import('../services/auth/firebaseAuth');
  return module.loadFirebaseAuthService();
};

export function AuthProvider({
  children,
  configuredOverride,
  serviceLoader = defaultLoader,
}: {
  children: ReactNode;
  configuredOverride?: boolean;
  serviceLoader?: AuthServiceLoader;
}) {
  const configured = configuredOverride ?? isFirebaseConfigured;
  const [ready, setReady] = useState(!configured);
  const [user, setUser] = useState<EcoRutaAuthUser | null>(null);
  const [initializationError, setInitializationError] = useState('');
  const servicePromise = useRef<Promise<AuthService> | null>(null);

  const getService = useCallback(() => {
    if (!configured) return Promise.reject({ code: 'auth/configuration-not-found' });
    servicePromise.current ??= serviceLoader();
    return servicePromise.current;
  }, [configured, serviceLoader]);

  useEffect(() => {
    if (!configured) {
      setReady(true);
      setUser(null);
      return;
    }

    let active = true;
    let unsubscribe: () => void = () => undefined;
    setReady(false);
    setInitializationError('');
    void getService()
      .then((service) => {
        if (!active) return;
        unsubscribe = service.subscribe((nextUser) => {
          if (!active) return;
          setUser(nextUser);
          setReady(true);
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setInitializationError(getAuthErrorMessage(error));
        setReady(true);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [configured, getService]);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await (await getService()).register(input);
    setUser(result.user);
    return result;
  }, [getService]);
  const signIn = useCallback(async (email: string, password: string) => {
    const nextUser = await (await getService()).signIn(email, password);
    setUser(nextUser);
    return nextUser;
  }, [getService]);
  const resendEmailVerification = useCallback(async () => (await getService()).resendEmailVerification(), [getService]);
  const refreshUser = useCallback(async () => {
    const nextUser = await (await getService()).refreshUser();
    setUser(nextUser);
    return nextUser;
  }, [getService]);
  const sendPasswordReset = useCallback(async (email: string) => (await getService()).sendPasswordReset(email), [getService]);
  const getIdToken = useCallback(async () => (await getService()).getIdToken(), [getService]);
  const signOut = useCallback(async () => {
    await (await getService()).signOut();
    setUser(null);
  }, [getService]);

  const value = useMemo<AuthContextValue>(() => ({
    configured,
    ready,
    user,
    initializationError,
    register,
    signIn,
    resendEmailVerification,
    refreshUser,
    getIdToken,
    sendPasswordReset,
    signOut,
  }), [configured, getIdToken, initializationError, ready, refreshUser, register, resendEmailVerification, sendPasswordReset, signIn, signOut, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
