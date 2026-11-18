import { describe, expect, it } from 'vitest';
import type { Favorite } from '../data/types';
import { favoriteToMapNavigationState, getNavigationActiveEndpoint, isMapNavigationState } from './mapState';

const origin = { label: 'Origen', detail: 'Lima', latitude: -12.0464, longitude: -77.0428 };
const destination = { label: 'Destino', detail: 'Lima', latitude: -12.1183, longitude: -77.0282 };

describe('map navigation from local activity', () => {
  it('loads a place favorite as destination and requests an origin next', () => {
    const favorite: Favorite = {
      id: 'place-1',
      kind: 'place',
      name: 'Destino guardado',
      place: destination,
      dedupeKey: 'place:key',
      createdAt: '2026-11-18T00:00:00.000Z',
      updatedAt: '2026-11-18T00:00:00.000Z',
    };

    const state = favoriteToMapNavigationState(favorite);
    expect(state).toEqual({ destination, source: 'favorite' });
    expect(getNavigationActiveEndpoint(state)).toBe('origin');
    expect(isMapNavigationState(state)).toBe(true);
  });

  it('loads both endpoints and the preferred mode from a route favorite', () => {
    const favorite: Favorite = {
      id: 'route-1',
      kind: 'route',
      name: 'Ruta guardada',
      origin,
      destination,
      mode: 'bicycle',
      dedupeKey: 'route:key',
      createdAt: '2026-11-18T00:00:00.000Z',
      updatedAt: '2026-11-18T00:00:00.000Z',
    };

    const state = favoriteToMapNavigationState(favorite);
    expect(state).toEqual({ origin, destination, preferredMode: 'bicycle', source: 'favorite' });
    expect(getNavigationActiveEndpoint(state)).toBe('destination');
    expect(isMapNavigationState(state)).toBe(true);
  });

  it('rejects incomplete navigation data with invalid coordinates', () => {
    expect(isMapNavigationState({ destination: { ...destination, latitude: Number.NaN } })).toBe(false);
    expect(isMapNavigationState({ source: 'favorite' })).toBe(false);
  });
});
