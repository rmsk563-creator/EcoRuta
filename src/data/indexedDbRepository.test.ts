import { openDB } from 'idb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompletedTrip, createFavoritePlace, createFavoriteRoute } from './factories';
import { deleteEcoRutaDatabase, IndexedDbEcoRutaRepository } from './indexedDbRepository';
import { parseDataExportText } from './validation';
import type { PlaceSelection, RouteResult } from '../services/geoapify/types';

const ORIGIN: PlaceSelection = {
  id: 'origin',
  label: 'Plaza Mayor de Lima',
  detail: 'Centro Histórico, Lima',
  coordinates: { latitude: -12.0453, longitude: -77.0309 },
};

const DESTINATION: PlaceSelection = {
  id: 'destination',
  label: 'Parque Kennedy',
  detail: 'Miraflores, Lima',
  coordinates: { latitude: -12.1211, longitude: -77.0297 },
};

const ROUTE: RouteResult = {
  mode: 'bicycle',
  distanceMeters: 10_050,
  durationSeconds: 2_220,
  geometry: { type: 'LineString', coordinates: [[-77.0309, -12.0453], [-77.0297, -12.1211]] },
};

let databaseName = '';

beforeEach(() => {
  databaseName = `ecoruta-test-${crypto.randomUUID()}`;
});

afterEach(async () => {
  await deleteEcoRutaDatabase(databaseName);
});

describe('IndexedDbEcoRutaRepository', () => {
  it('saves, retrieves, edits and deletes favorites', async () => {
    const repository = new IndexedDbEcoRutaRepository(databaseName);
    const favorite = createFavoritePlace(DESTINATION);
    await repository.putFavorite(favorite);
    expect(await repository.listFavorites()).toEqual([favorite]);

    const renamed = { ...favorite, name: 'Parque favorito', updatedAt: new Date(Date.now() + 1000).toISOString() };
    await repository.putFavorite(renamed);
    expect((await repository.listFavorites())[0]?.name).toBe('Parque favorito');

    await repository.deleteFavorite(favorite.id);
    expect(await repository.listFavorites()).toEqual([]);
    await repository.close();
  });

  it('keeps favorites and completed trips after reopening the database', async () => {
    const first = new IndexedDbEcoRutaRepository(databaseName);
    const favorite = createFavoriteRoute(ORIGIN, DESTINATION, 'bicycle');
    const trip = createCompletedTrip(ORIGIN, DESTINATION, ROUTE, true, new Date('2026-11-17T12:00:00-05:00'));
    await first.putFavorite(favorite);
    await first.putTrip(trip);
    await first.close();

    const reopened = new IndexedDbEcoRutaRepository(databaseName);
    expect(await reopened.listFavorites()).toEqual([favorite]);
    expect(await reopened.listTrips()).toEqual([trip]);
    await reopened.close();
  });

  it('keeps consulted routes out of history until a completed trip is explicitly saved', async () => {
    const repository = new IndexedDbEcoRutaRepository(databaseName);
    expect(await repository.listTrips()).toEqual([]);
    const trip = createCompletedTrip(ORIGIN, DESTINATION, ROUTE, false);
    await repository.putTrip(trip);
    expect(await repository.listTrips()).toHaveLength(1);
    await repository.close();
  });

  it('merges exports without duplicating favorites or trips', async () => {
    const repository = new IndexedDbEcoRutaRepository(databaseName);
    const favorite = createFavoriteRoute(ORIGIN, DESTINATION, 'bicycle');
    const trip = createCompletedTrip(ORIGIN, DESTINATION, ROUTE, true);
    await repository.putFavorite(favorite);
    await repository.putTrip(trip);
    const exported = await repository.exportData();
    const summary = await repository.importData(exported, 'merge');
    expect(summary).toEqual({ favorites: 0, trips: 0 });
    expect(await repository.listFavorites()).toHaveLength(1);
    expect(await repository.listTrips()).toHaveLength(1);
    await repository.close();
  });

  it('migrates a version 1 database to schema version 2', async () => {
    const legacy = await openDB(databaseName, 1, {
      upgrade(database) {
        const favorites = database.createObjectStore('favorites', { keyPath: 'id' });
        favorites.createIndex('by-dedupe', 'dedupeKey', { unique: true });
        const trips = database.createObjectStore('trips', { keyPath: 'id' });
        trips.createIndex('by-completed-at', 'completedAt');
        database.createObjectStore('metadata', { keyPath: 'key' });
      },
    });
    legacy.close();

    const repository = new IndexedDbEcoRutaRepository(databaseName);
    await repository.initialize();
    const migrated = await openDB(databaseName);
    expect(migrated.version).toBe(2);
    expect(Array.from(migrated.transaction('favorites').store.indexNames)).toContain('by-kind');
    expect(Array.from(migrated.transaction('trips').store.indexNames)).toContain('by-mode');
    migrated.close();
    await repository.close();
  });

  it('rejects malformed imports instead of writing partial data', () => {
    expect(() => parseDataExportText('{"format":"ecoruta-local-data","exportVersion":1,"favorites":[{}]}')).toThrow(/favoritos no válidos|versión o fecha/i);
    expect(() => parseDataExportText('{broken')).toThrow(/mal formado/i);
  });
});

