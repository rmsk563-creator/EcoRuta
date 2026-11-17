import type { CompletedTrip, EcoRutaDataExport, Favorite, ImportStrategy, ImportSummary } from './types';

export interface EcoRutaRepository {
  readonly engine: 'indexeddb' | 'sqlite';
  initialize(): Promise<void>;
  listFavorites(): Promise<Favorite[]>;
  putFavorite(favorite: Favorite): Promise<void>;
  deleteFavorite(id: string): Promise<void>;
  clearFavorites(): Promise<void>;
  listTrips(): Promise<CompletedTrip[]>;
  putTrip(trip: CompletedTrip): Promise<void>;
  deleteTrip(id: string): Promise<void>;
  clearTrips(): Promise<void>;
  clearAll(): Promise<void>;
  exportData(): Promise<EcoRutaDataExport>;
  importData(data: EcoRutaDataExport, strategy: ImportStrategy): Promise<ImportSummary>;
  close(): Promise<void>;
}

