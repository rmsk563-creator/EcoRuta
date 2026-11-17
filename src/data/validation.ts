import { EcoRutaStorageError } from './errors';
import { DATA_EXPORT_VERSION, type CompletedTrip, type EcoRutaDataExport, type Favorite, type StoredPlace } from './types';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIsoDate(value: unknown) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isPlace(value: unknown): value is StoredPlace {
  if (!isObject(value)) return false;
  return (
    typeof value.label === 'string' && value.label.trim().length > 0 && value.label.length <= 180 &&
    typeof value.detail === 'string' && value.detail.length <= 300 &&
    typeof value.latitude === 'number' && Number.isFinite(value.latitude) && value.latitude >= -90 && value.latitude <= 90 &&
    typeof value.longitude === 'number' && Number.isFinite(value.longitude) && value.longitude >= -180 && value.longitude <= 180
  );
}

export function isFavorite(value: unknown): value is Favorite {
  if (!isObject(value)) return false;
  const baseValid = (
    typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 100 &&
    typeof value.name === 'string' && value.name.trim().length > 0 && value.name.length <= 120 &&
    typeof value.dedupeKey === 'string' && value.dedupeKey.length > 0 && value.dedupeKey.length <= 240 &&
    isIsoDate(value.createdAt) && isIsoDate(value.updatedAt)
  );
  if (!baseValid) return false;
  if (value.kind === 'place') return isPlace(value.place);
  return value.kind === 'route' && isPlace(value.origin) && isPlace(value.destination) && ['walk', 'bicycle'].includes(String(value.mode));
}

export function isCompletedTrip(value: unknown): value is CompletedTrip {
  if (!isObject(value)) return false;
  return (
    value.recordType === 'completed-trip' &&
    typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 100 &&
    isPlace(value.origin) && isPlace(value.destination) &&
    ['walk', 'bicycle'].includes(String(value.mode)) &&
    typeof value.distanceMeters === 'number' && Number.isFinite(value.distanceMeters) && value.distanceMeters > 0 && value.distanceMeters <= 1_000_000 &&
    typeof value.durationSeconds === 'number' && Number.isFinite(value.durationSeconds) && value.durationSeconds > 0 && value.durationSeconds <= 7 * 24 * 60 * 60 &&
    isIsoDate(value.completedAt) && isIsoDate(value.createdAt) &&
    value.provider === 'geoapify' && typeof value.wouldReplaceCar === 'boolean'
  );
}

export function parseDataExport(value: unknown): EcoRutaDataExport {
  if (!isObject(value) || value.format !== 'ecoruta-local-data' || value.exportVersion !== DATA_EXPORT_VERSION) {
    throw new EcoRutaStorageError('validation', 'El archivo no es una exportación compatible de EcoRuta.');
  }
  if (!Array.isArray(value.favorites) || !value.favorites.every(isFavorite)) {
    throw new EcoRutaStorageError('validation', 'El archivo contiene favoritos no válidos.');
  }
  if (!Array.isArray(value.trips) || !value.trips.every(isCompletedTrip)) {
    throw new EcoRutaStorageError('validation', 'El archivo contiene recorridos no válidos.');
  }
  if (!isIsoDate(value.exportedAt) || typeof value.schemaVersion !== 'number') {
    throw new EcoRutaStorageError('validation', 'La versión o fecha de la exportación no es válida.');
  }
  if (value.favorites.length > 10_000 || value.trips.length > 100_000) {
    throw new EcoRutaStorageError('validation', 'La exportación supera los límites de seguridad permitidos.');
  }
  return value as unknown as EcoRutaDataExport;
}

export function parseDataExportText(text: string) {
  if (text.length > 25 * 1024 * 1024) {
    throw new EcoRutaStorageError('validation', 'El archivo supera el límite de 25 MB.');
  }
  try {
    return parseDataExport(JSON.parse(text) as unknown);
  } catch (error) {
    if (error instanceof EcoRutaStorageError) throw error;
    throw new EcoRutaStorageError('validation', 'El archivo JSON está mal formado.', error);
  }
}

