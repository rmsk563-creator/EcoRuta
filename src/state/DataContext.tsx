import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createEcoRutaRepository } from '../data/createRepository';
import { toStorageError } from '../data/errors';
import type { EcoRutaRepository } from '../data/repository';
import type { CompletedTrip, EcoRutaDataExport, Favorite, ImportStrategy, ImportSummary } from '../data/types';

interface DataContextValue {
  favorites: Favorite[];
  trips: CompletedTrip[];
  ready: boolean;
  engine: EcoRutaRepository['engine'] | null;
  error: string;
  clearError: () => void;
  saveFavorite: (favorite: Favorite) => Promise<void>;
  renameFavorite: (id: string, name: string) => Promise<void>;
  deleteFavorite: (id: string) => Promise<void>;
  clearFavorites: () => Promise<void>;
  saveTrip: (trip: CompletedTrip) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  clearTrips: () => Promise<void>;
  clearAll: () => Promise<void>;
  exportData: () => Promise<EcoRutaDataExport>;
  importData: (data: EcoRutaDataExport, strategy: ImportStrategy) => Promise<ImportSummary>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const repository = useRef<EcoRutaRepository | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [trips, setTrips] = useState<CompletedTrip[]>([]);
  const [engine, setEngine] = useState<EcoRutaRepository['engine'] | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async (source = repository.current) => {
    if (!source) return;
    const [nextFavorites, nextTrips] = await Promise.all([source.listFavorites(), source.listTrips()]);
    setFavorites(nextFavorites);
    setTrips(nextTrips);
  }, []);

  useEffect(() => {
    let active = true;
    let opened: EcoRutaRepository | null = null;
    createEcoRutaRepository()
      .then(async (source) => {
        opened = source;
        await source.initialize();
        if (!active) return;
        repository.current = source;
        setEngine(source.engine);
        await refresh(source);
      })
      .catch((reason) => {
        if (active) setError(toStorageError(reason).message);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
      if (opened && repository.current !== opened) void opened.close();
    };
  }, [refresh]);

  const requireRepository = useCallback(() => {
    if (!repository.current) throw new Error('El almacenamiento local todavía no está listo.');
    return repository.current;
  }, []);

  const run = useCallback(async <T,>(action: (source: EcoRutaRepository) => Promise<T>, shouldRefresh = true) => {
    try {
      setError('');
      const result = await action(requireRepository());
      if (shouldRefresh) await refresh();
      return result;
    } catch (reason) {
      const storageError = toStorageError(reason);
      setError(storageError.message);
      throw storageError;
    }
  }, [refresh, requireRepository]);

  const value = useMemo<DataContextValue>(() => ({
    favorites,
    trips,
    ready,
    engine,
    error,
    clearError: () => setError(''),
    saveFavorite: (favorite) => run((source) => source.putFavorite(favorite)).then(() => undefined),
    renameFavorite: (id, name) => run(async (source) => {
      const favorite = favorites.find((item) => item.id === id);
      if (!favorite) throw new Error('El favorito ya no existe.');
      await source.putFavorite({ ...favorite, name: name.trim(), updatedAt: new Date().toISOString() });
    }).then(() => undefined),
    deleteFavorite: (id) => run((source) => source.deleteFavorite(id)).then(() => undefined),
    clearFavorites: () => run((source) => source.clearFavorites()).then(() => undefined),
    saveTrip: (trip) => run((source) => source.putTrip(trip)).then(() => undefined),
    deleteTrip: (id) => run((source) => source.deleteTrip(id)).then(() => undefined),
    clearTrips: () => run((source) => source.clearTrips()).then(() => undefined),
    clearAll: () => run((source) => source.clearAll()).then(() => undefined),
    exportData: () => run((source) => source.exportData(), false),
    importData: (data, strategy) => run((source) => source.importData(data, strategy)),
  }), [engine, error, favorites, ready, run, trips]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useEcoRutaData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useEcoRutaData must be used inside DataProvider');
  return context;
}

