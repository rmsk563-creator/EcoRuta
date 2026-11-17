import type { RouteMode } from '../services/geoapify/types';
import type { StoredPlace } from '../data/types';

export interface MapNavigationState {
  origin?: StoredPlace;
  destination?: StoredPlace;
  preferredMode?: RouteMode;
  source?: 'favorite' | 'history';
}

export function isMapNavigationState(value: unknown): value is MapNavigationState {
  return typeof value === 'object' && value !== null;
}

