import type { Map as MapLibreMap } from 'maplibre-gl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const markerMock = vi.hoisted(() => {
  const calls: string[] = [];
  const marker = {
    setLngLat: vi.fn(() => {
      calls.push('setLngLat');
      return marker;
    }),
    addTo: vi.fn(() => {
      calls.push('addTo');
      return marker;
    }),
    remove: vi.fn(),
  };
  return { calls, marker };
});

vi.mock('maplibre-gl', () => ({
  Marker: vi.fn(function MarkerMock() {
    return markerMock.marker;
  }),
  setWorkerUrl: vi.fn(),
}));

import { updateMarker } from './MapCanvas';

describe('MapCanvas markers', () => {
  beforeEach(() => {
    markerMock.calls.length = 0;
    vi.clearAllMocks();
  });

  it('sets coordinates before adding a new marker to MapLibre', () => {
    const marker = updateMarker(
      null,
      {} as MapLibreMap,
      { longitude: -77.0297, latitude: -12.1211 },
      'A',
      'origin',
    );

    expect(marker).toBe(markerMock.marker);
    expect(markerMock.calls).toEqual(['setLngLat', 'addTo']);
    expect(markerMock.marker.setLngLat).toHaveBeenCalledWith([-77.0297, -12.1211]);
  });

  it('updates an existing marker without adding it to the map again', () => {
    updateMarker(
      markerMock.marker as never,
      {} as MapLibreMap,
      { longitude: -77.0309, latitude: -12.0453 },
      'B',
      'destination',
    );

    expect(markerMock.calls).toEqual(['setLngLat']);
    expect(markerMock.marker.addTo).not.toHaveBeenCalled();
  });
});
