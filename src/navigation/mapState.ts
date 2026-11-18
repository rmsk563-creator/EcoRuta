import type { EndpointRole, RouteMode } from '../services/geoapify/types';
import type { Favorite, StoredPlace } from '../data/types';

export interface MapNavigationState {
  origin?: StoredPlace;
  destination?: StoredPlace;
  preferredMode?: RouteMode;
  source?: 'favorite' | 'history';
}

export function favoriteToMapNavigationState(favorite: Favorite): MapNavigationState {
  return favorite.kind === 'place'
    ? { destination: favorite.place, source: 'favorite' }
    : { origin: favorite.origin, destination: favorite.destination, preferredMode: favorite.mode, source: 'favorite' };
}

export function getNavigationActiveEndpoint(state: MapNavigationState): EndpointRole {
  return state.destination && !state.origin ? 'origin' : 'destination';
}

export function isMapNavigationState(value: unknown): value is MapNavigationState {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as Record<string, unknown>;
  const isStoredPlace = (place: unknown) => {
    if (typeof place !== 'object' || place === null) return false;
    const candidate = place as Record<string, unknown>;
    return typeof candidate.label === 'string'
      && typeof candidate.detail === 'string'
      && typeof candidate.latitude === 'number'
      && Number.isFinite(candidate.latitude)
      && typeof candidate.longitude === 'number'
      && Number.isFinite(candidate.longitude);
  };
  if ('origin' in state && state.origin !== undefined && !isStoredPlace(state.origin)) return false;
  if ('destination' in state && state.destination !== undefined && !isStoredPlace(state.destination)) return false;
  if (!isStoredPlace(state.origin) && !isStoredPlace(state.destination)) return false;
  if ('preferredMode' in state && state.preferredMode !== undefined && state.preferredMode !== 'walk' && state.preferredMode !== 'bicycle') return false;
  if ('source' in state && state.source !== undefined && state.source !== 'favorite' && state.source !== 'history') return false;
  return true;
}

