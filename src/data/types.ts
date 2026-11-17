import type { RouteMode } from '../services/geoapify/types';

export const DATA_SCHEMA_VERSION = 2;
export const DATA_EXPORT_VERSION = 1;

export interface StoredPlace {
  label: string;
  detail: string;
  latitude: number;
  longitude: number;
}

interface FavoriteBase {
  id: string;
  name: string;
  dedupeKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface FavoritePlace extends FavoriteBase {
  kind: 'place';
  place: StoredPlace;
}

export interface FavoriteRoute extends FavoriteBase {
  kind: 'route';
  origin: StoredPlace;
  destination: StoredPlace;
  mode: RouteMode;
}

export type Favorite = FavoritePlace | FavoriteRoute;

export interface CompletedTrip {
  id: string;
  recordType: 'completed-trip';
  origin: StoredPlace;
  destination: StoredPlace;
  mode: RouteMode;
  distanceMeters: number;
  durationSeconds: number;
  completedAt: string;
  createdAt: string;
  provider: 'geoapify';
  wouldReplaceCar: boolean;
}

export interface EcoRutaDataExport {
  format: 'ecoruta-local-data';
  exportVersion: typeof DATA_EXPORT_VERSION;
  schemaVersion: number;
  exportedAt: string;
  favorites: Favorite[];
  trips: CompletedTrip[];
}

export type ImportStrategy = 'merge' | 'replace';

export interface ImportSummary {
  favorites: number;
  trips: number;
}

