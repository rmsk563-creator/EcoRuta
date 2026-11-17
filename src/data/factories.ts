import type { PlaceSelection, RouteMode, RouteResult } from '../services/geoapify/types';
import type { CompletedTrip, Favorite, StoredPlace } from './types';

export function toStoredPlace(place: PlaceSelection): StoredPlace {
  return {
    label: place.label.trim(),
    detail: place.detail.trim(),
    latitude: place.coordinates.latitude,
    longitude: place.coordinates.longitude,
  };
}

export function toPlaceSelection(place: StoredPlace): PlaceSelection {
  return {
    id: `stored:${place.latitude.toFixed(6)},${place.longitude.toFixed(6)}`,
    label: place.label,
    detail: place.detail,
    coordinates: { latitude: place.latitude, longitude: place.longitude },
  };
}

function coordinateKey(place: StoredPlace) {
  return `${place.latitude.toFixed(5)},${place.longitude.toFixed(5)}`;
}

export function favoritePlaceKey(place: StoredPlace) {
  return `place:${coordinateKey(place)}`;
}

export function favoriteRouteKey(origin: StoredPlace, destination: StoredPlace, mode: RouteMode) {
  return `route:${coordinateKey(origin)}:${coordinateKey(destination)}:${mode}`;
}

export function createFavoritePlace(place: PlaceSelection, name = place.label): Favorite {
  const storedPlace = toStoredPlace(place);
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    kind: 'place',
    name: name.trim() || place.label,
    place: storedPlace,
    dedupeKey: favoritePlaceKey(storedPlace),
    createdAt: now,
    updatedAt: now,
  };
}

export function createFavoriteRoute(
  origin: PlaceSelection,
  destination: PlaceSelection,
  mode: RouteMode,
  name = `${origin.label} → ${destination.label}`,
): Favorite {
  const storedOrigin = toStoredPlace(origin);
  const storedDestination = toStoredPlace(destination);
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    kind: 'route',
    name: name.trim() || `${origin.label} → ${destination.label}`,
    origin: storedOrigin,
    destination: storedDestination,
    mode,
    dedupeKey: favoriteRouteKey(storedOrigin, storedDestination, mode),
    createdAt: now,
    updatedAt: now,
  };
}

export function createCompletedTrip(
  origin: PlaceSelection,
  destination: PlaceSelection,
  route: RouteResult,
  wouldReplaceCar: boolean,
  completedAt = new Date(),
): CompletedTrip {
  const timestamp = completedAt.toISOString();
  return {
    id: crypto.randomUUID(),
    recordType: 'completed-trip',
    origin: toStoredPlace(origin),
    destination: toStoredPlace(destination),
    mode: route.mode,
    distanceMeters: route.distanceMeters,
    durationSeconds: route.durationSeconds,
    completedAt: timestamp,
    createdAt: new Date().toISOString(),
    provider: 'geoapify',
    wouldReplaceCar,
  };
}

