import { Preferences } from '@capacitor/preferences';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
export type AccentPreference = 'eco' | 'ocean' | 'turquoise' | 'purple' | 'orange';
export type PreferredMode = 'walk' | 'bicycle';
export type DistanceUnitPreference = 'adaptive' | 'kilometers';

export interface AppPreferences {
  theme: ThemePreference;
  accent: AccentPreference;
  reduceMotion: boolean;
  alias: string;
  preferredMode: PreferredMode;
  distanceUnit: DistanceUnitPreference;
  allowTripStorage: boolean;
}

const STORAGE_KEY = 'ecoruta.preferences.v3';
const PREVIOUS_STORAGE_KEY = 'ecoruta.preferences.v2';
const LEGACY_STORAGE_KEY = 'ecoruta.preferences.v1';
const defaults: AppPreferences = {
  theme: 'system',
  accent: 'eco',
  reduceMotion: false,
  alias: '',
  preferredMode: 'walk',
  distanceUnit: 'adaptive',
  allowTripStorage: true,
};

interface PreferencesContextValue {
  preferences: AppPreferences;
  ready: boolean;
  updatePreferences: (patch: Partial<AppPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function parsePreferences(value: unknown): AppPreferences | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<AppPreferences>;
  if (!['system', 'light', 'dark'].includes(candidate.theme ?? '') || typeof candidate.reduceMotion !== 'boolean') return null;
  return {
    theme: candidate.theme as ThemePreference,
    accent: ['eco', 'ocean', 'turquoise', 'purple', 'orange'].includes(candidate.accent ?? '')
      ? candidate.accent as AccentPreference
      : 'eco',
    reduceMotion: candidate.reduceMotion,
    alias: typeof candidate.alias === 'string' ? candidate.alias.slice(0, 60) : '',
    preferredMode: ['walk', 'bicycle'].includes(candidate.preferredMode ?? '') ? candidate.preferredMode as PreferredMode : 'walk',
    distanceUnit: ['adaptive', 'kilometers'].includes(candidate.distanceUnit ?? '') ? candidate.distanceUnit as DistanceUnitPreference : 'adaptive',
    allowTripStorage: typeof candidate.allowTripStorage === 'boolean' ? candidate.allowTripStorage : true,
  };
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
    Promise.all([
      Preferences.get({ key: STORAGE_KEY }),
      Preferences.get({ key: PREVIOUS_STORAGE_KEY }),
      Preferences.get({ key: LEGACY_STORAGE_KEY }),
    ])
      .then(async ([current, previous, legacy]) => {
        if (!active) return;
        const raw = current.value ?? previous.value ?? legacy.value;
        if (!raw) return;
        const parsed = parsePreferences(JSON.parse(raw) as unknown);
        if (!parsed) return;
        setPreferences(parsed);
        if (!current.value) await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(parsed) });
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
      document.documentElement.dataset.accent = preferences.accent;
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
  }, [preferences.accent, preferences.reduceMotion, preferences.theme]);

  const persist = useCallback(async (next: AppPreferences) => {
    setPreferences(next);
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(next) });
  }, []);

  const updatePreferences = useCallback(
    async (patch: Partial<AppPreferences>) => persist({ ...preferences, ...patch }),
    [persist, preferences],
  );

  const resetPreferences = useCallback(async () => {
    await Promise.all([
      Preferences.remove({ key: STORAGE_KEY }),
      Preferences.remove({ key: PREVIOUS_STORAGE_KEY }),
      Preferences.remove({ key: LEGACY_STORAGE_KEY }),
    ]);
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
