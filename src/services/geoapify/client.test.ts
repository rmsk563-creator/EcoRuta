import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Geoapify client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_GEOAPIFY_API_KEY', 'test-key');
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('limits autocomplete searches to Lima and caches identical queries', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      results: [{
        place_id: 'kennedy',
        address_line1: 'Parque Kennedy',
        address_line2: 'Miraflores, Lima, Perú',
        formatted: 'Parque Kennedy, Miraflores, Lima, Perú',
        lat: -12.1211,
        lon: -77.0297,
      }],
    }));
    vi.stubGlobal('fetch', fetchMock);
    const { searchLimaPlaces } = await import('./client');

    const first = await searchLimaPlaces('Parque Kennedy');
    const second = await searchLimaPlaces('Parque Kennedy');

    expect(first).toEqual(second);
    expect(first[0]?.label).toBe('Parque Kennedy');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(url.pathname).toBe('/v1/geocode/autocomplete');
    expect(url.searchParams.get('filter')).toContain('countrycode:pe');
    expect(url.searchParams.get('bias')).toBe('proximity:-77.0428,-12.0464');
    expect(url.searchParams.get('limit')).toBe('5');
  });

  it('returns verified route distance, duration and geometry', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      features: [{
        properties: { distance: 4321, time: 1450 },
        geometry: { type: 'MultiLineString', coordinates: [[[-77.04, -12.04], [-77.02, -12.1]]] },
      }],
    }));
    vi.stubGlobal('fetch', fetchMock);
    const { calculateRoute } = await import('./client');

    const result = await calculateRoute(
      { latitude: -12.04, longitude: -77.04 },
      { latitude: -12.1, longitude: -77.02 },
      'bicycle',
    );

    expect(result).toMatchObject({ mode: 'bicycle', distanceMeters: 4321, durationSeconds: 1450 });
    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(url.searchParams.get('mode')).toBe('bicycle');
    expect(url.searchParams.get('waypoints')).toBe('-12.04,-77.04|-12.1,-77.02');
  });

  it('maps quota responses to a comprehensible error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 429)));
    const { searchLimaPlaces } = await import('./client');

    await expect(searchLimaPlaces('Plaza Mayor')).rejects.toMatchObject({ code: 'quota', status: 429 });
  });

  it('rejects malformed route responses instead of inventing metrics', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ features: [] })));
    const { calculateRoute } = await import('./client');

    await expect(calculateRoute(
      { latitude: -12.04, longitude: -77.04 },
      { latitude: -12.1, longitude: -77.02 },
      'walk',
    )).rejects.toMatchObject({ code: 'no_route' });
  });
});
