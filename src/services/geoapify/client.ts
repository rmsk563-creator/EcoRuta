import { geoapifyApiKey, LIMA_BOUNDS, LIMA_CENTER } from '../../config/geoapify';
import { GeoapifyError } from './errors';
import { geoapifyRequestManager } from './requestManager';
import type { Coordinates, ExploreCategory, ExplorePlace, PlaceSelection, RouteGeometry, RouteMode, RouteResult } from './types';

const API_BASE_URL = 'https://api.geoapify.com/v1';
const PLACES_API_BASE_URL = 'https://api.geoapify.com/v2';
const REQUEST_TIMEOUT_MS = 12_000;
const CACHE_TTL_MS = 10 * 60 * 1000;

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

const cache = new Map<string, CacheEntry<unknown>>();

interface GeoapifyPlace {
  place_id?: string;
  name?: string;
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
  lat?: number;
  lon?: number;
}

interface PlacesResponse {
  results?: GeoapifyPlace[];
}

interface RouteFeature {
  properties?: {
    distance?: number;
    time?: number;
  };
  geometry?: RouteGeometry;
}

interface RoutingResponse {
  features?: RouteFeature[];
}

interface PlacesFeature {
  properties?: GeoapifyPlace & {
    categories?: string[];
    distance?: number;
  };
}

interface PlacesFeatureCollection {
  features?: PlacesFeature[];
}

const EXPLORE_CATEGORIES: Record<ExploreCategory, string> = {
  parks: 'leisure.park',
  culture: 'entertainment.culture,entertainment.museum',
  destinations: 'tourism.attraction,tourism.sights',
};

function getCached<T>(key: string) {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function setCached<T>(key: string, value: T) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function linkAbortSignal(source: AbortSignal | undefined, target: AbortController) {
  if (!source) return () => undefined;
  const abort = () => target.abort();
  if (source.aborted) target.abort();
  else source.addEventListener('abort', abort, { once: true });
  return () => source.removeEventListener('abort', abort);
}

async function requestJson<T>(path: string, parameters: URLSearchParams, signal?: AbortSignal, baseUrl = API_BASE_URL): Promise<T> {
  if (!geoapifyApiKey) {
    throw new GeoapifyError('configuration', 'Geoapify todavía no está configurado en este dispositivo.');
  }

  await geoapifyRequestManager.acquire(signal);
  const controller = new AbortController();
  const unlink = linkAbortSignal(signal, controller);
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  parameters.set('apiKey', geoapifyApiKey);

  try {
    const response = await fetch(`${baseUrl}${path}?${parameters.toString()}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (response.status === 401 || response.status === 403) {
      throw new GeoapifyError('configuration', 'La API key fue rechazada. Revisa la clave y sus restricciones.', response.status);
    }
    if (response.status === 429) {
      throw new GeoapifyError('quota', 'Geoapify alcanzó su cuota o límite temporal. Espera unos minutos antes de reintentar.', 429);
    }
    if (response.status >= 500) {
      throw new GeoapifyError('service', 'Geoapify no está disponible temporalmente. Inténtalo más tarde.', response.status);
    }
    if (!response.ok) {
      throw new GeoapifyError('service', 'Geoapify no pudo procesar la solicitud.', response.status);
    }
    return await response.json() as T;
  } catch (error) {
    if (error instanceof GeoapifyError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      if (signal?.aborted) throw error;
      throw new GeoapifyError('timeout', 'La solicitud tardó demasiado. Comprueba tu conexión e inténtalo de nuevo.');
    }
    throw new GeoapifyError('network', 'No hay conexión con Geoapify. Comprueba tu red e inténtalo nuevamente.');
  } finally {
    window.clearTimeout(timeout);
    unlink();
  }
}

export async function exploreLimaPlaces(
  category: ExploreCategory,
  userLocation?: Coordinates | null,
  signal?: AbortSignal,
) {
  const locationKey = userLocation
    ? `${userLocation.latitude.toFixed(3)},${userLocation.longitude.toFixed(3)}`
    : 'lima';
  const cacheKey = `explore:${category}:${locationKey}`;
  const cached = getCached<ExplorePlace[]>(cacheKey);
  if (cached) return cached;

  const parameters = new URLSearchParams({
    categories: EXPLORE_CATEGORIES[category],
    lang: 'es',
    limit: '20',
  });
  if (userLocation) {
    const proximity = `${userLocation.longitude},${userLocation.latitude}`;
    parameters.set('filter', `circle:${proximity},12000`);
    parameters.set('bias', `proximity:${proximity}`);
  } else {
    parameters.set('filter', `rect:${LIMA_BOUNDS.west},${LIMA_BOUNDS.south},${LIMA_BOUNDS.east},${LIMA_BOUNDS.north}`);
    parameters.set('bias', `proximity:${LIMA_CENTER.longitude},${LIMA_CENTER.latitude}`);
  }

  const response = await requestJson<PlacesFeatureCollection>('/places', parameters, signal, PLACES_API_BASE_URL);
  const places = (response.features ?? []).flatMap((feature) => {
    const properties = feature.properties;
    if (!properties?.name?.trim()) return [];
    const place = toPlace(properties);
    if (!place) return [];
    return [{
      ...place,
      label: properties.name.trim(),
      categories: properties.categories ?? [],
      ...(userLocation && typeof properties.distance === 'number' ? { distanceMeters: properties.distance } : {}),
    } satisfies ExplorePlace];
  });
  setCached(cacheKey, places);
  return places;
}

function toPlace(place: GeoapifyPlace): PlaceSelection | null {
  if (typeof place.lat !== 'number' || typeof place.lon !== 'number') return null;
  const label = place.address_line1 ?? place.formatted;
  if (!label) return null;
  return {
    id: place.place_id ?? `${place.lat},${place.lon}`,
    label,
    detail: place.address_line2 ?? place.formatted ?? 'Lima, Perú',
    coordinates: { latitude: place.lat, longitude: place.lon },
  };
}

export async function searchLimaPlaces(query: string, signal?: AbortSignal) {
  const normalized = query.trim().toLocaleLowerCase('es-PE');
  if (normalized.length < 3) return [];
  const cacheKey = `search:${normalized}`;
  const cached = getCached<PlaceSelection[]>(cacheKey);
  if (cached) return cached;

  const parameters = new URLSearchParams({
    text: query.trim(),
    format: 'json',
    lang: 'es',
    limit: '5',
    filter: `rect:${LIMA_BOUNDS.west},${LIMA_BOUNDS.south},${LIMA_BOUNDS.east},${LIMA_BOUNDS.north}|countrycode:pe`,
    bias: `proximity:${LIMA_CENTER.longitude},${LIMA_CENTER.latitude}`,
  });
  const response = await requestJson<PlacesResponse>('/geocode/autocomplete', parameters, signal);
  const places = (response.results ?? []).map(toPlace).filter((place): place is PlaceSelection => place !== null);
  setCached(cacheKey, places);
  return places;
}

export async function reverseGeocodeLima(coordinates: Coordinates, signal?: AbortSignal) {
  const rounded = `${coordinates.latitude.toFixed(5)},${coordinates.longitude.toFixed(5)}`;
  const cacheKey = `reverse:${rounded}`;
  const cached = getCached<PlaceSelection>(cacheKey);
  if (cached) return cached;

  const parameters = new URLSearchParams({
    lat: String(coordinates.latitude),
    lon: String(coordinates.longitude),
    format: 'json',
    lang: 'es',
    limit: '1',
  });
  const response = await requestJson<PlacesResponse>('/geocode/reverse', parameters, signal);
  const place = response.results?.map(toPlace).find((result): result is PlaceSelection => result !== null);
  if (!place) {
    return {
      id: `coordinate:${rounded}`,
      label: 'Punto seleccionado',
      detail: `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`,
      coordinates,
    } satisfies PlaceSelection;
  }
  setCached(cacheKey, place);
  return place;
}

export async function calculateRoute(
  origin: Coordinates,
  destination: Coordinates,
  mode: RouteMode,
  signal?: AbortSignal,
) {
  const cacheKey = [
    'route',
    mode,
    origin.latitude.toFixed(5),
    origin.longitude.toFixed(5),
    destination.latitude.toFixed(5),
    destination.longitude.toFixed(5),
  ].join(':');
  const cached = getCached<RouteResult>(cacheKey);
  if (cached) return cached;

  const parameters = new URLSearchParams({
    waypoints: `${origin.latitude},${origin.longitude}|${destination.latitude},${destination.longitude}`,
    mode,
    units: 'metric',
    lang: 'es',
  });
  const response = await requestJson<RoutingResponse>('/routing', parameters, signal);
  const feature = response.features?.[0];
  const distance = feature?.properties?.distance;
  const duration = feature?.properties?.time;
  const geometry = feature?.geometry;
  if (
    typeof distance !== 'number' ||
    typeof duration !== 'number' ||
    !geometry ||
    !['LineString', 'MultiLineString'].includes(geometry.type)
  ) {
    throw new GeoapifyError('no_route', `Geoapify no encontró una ruta válida para ${mode === 'walk' ? 'caminar' : 'bicicleta'}.`);
  }

  const route = { mode, distanceMeters: distance, durationSeconds: duration, geometry } satisfies RouteResult;
  setCached(cacheKey, route);
  return route;
}

export function clearGeoapifyMemoryCache() {
  cache.clear();
}
