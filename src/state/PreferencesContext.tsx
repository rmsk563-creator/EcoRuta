import { Preferences } from '@capacitor/preferences';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
export type MobilityPreference = 'walk' | 'bicycle';

export interface AppPreferences {
  theme: ThemePreference;
  reduceMotion: boolean;
  mobility: MobilityPreference[];
}

const STORAGE_KEY = 'ecoruta.preferences.v1';
const defaults: AppPreferences = {
  theme: 'system',
  reduceMotion: false,
  mobility: ['walk', 'bicycle'],
};

interface PreferencesContextValue {
  preferences: AppPreferences;
  ready: boolean;
  updatePreferences: (patch: Partial<AppPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function isPreferences(value: unknown): value is AppPreferences {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AppPreferences>;
  return (
    ['system', 'light', 'dark'].includes(candidate.theme ?? '') &&
    typeof candidate.reduceMotion === 'boolean' &&
    Array.isArray(candidate.mobility) &&
    candidate.mobility.every((mode) => mode === 'walk' || mode === 'bicycle')
  );
}

function resolveTheme(preference: ThemePreference) {
  if (preference !== 'system') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AppPreferences>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    Preferences.get({ key: STORAGE_KEY })
      .then(({ value }) => {
        if (!active || !value) return;
        const parsed: unknown = JSON.parse(value);
        if (isPreferences(parsed)) setPreferences(parsed);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const resolved = resolveTheme(preferences.theme);
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
      document.documentElement.dataset.reduceMotion = String(preferences.reduceMotion);
      let themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
      if (!themeColor) {
        themeColor = document.createElement('meta');
        themeColor.name = 'theme-color';
        document.head.append(themeColor);
      }
      themeColor.content = resolved === 'dark' ? '#101815' : '#f4f7f5';
    };
    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [preferences.reduceMotion, preferences.theme]);

  const persist = useCallback(async (next: AppPreferences) => {
    setPreferences(next);
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(next) });
  }, []);

  const updatePreferences = useCallback(
    async (patch: Partial<AppPreferences>) => persist({ ...preferences, ...patch }),
    [persist, preferences],
  );

  const resetPreferences = useCallback(async () => {
    await Preferences.remove({ key: STORAGE_KEY });
    setPreferences(defaults);
  }, []);

  const value = useMemo(
    () => ({ preferences, ready, updatePreferences, resetPreferences }),
    [preferences, ready, resetPreferences, updatePreferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside PreferencesProvider');
  return context;
}

