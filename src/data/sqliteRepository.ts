import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite';
import { EcoRutaStorageError, toStorageError } from './errors';
import type { EcoRutaRepository } from './repository';
import {
  DATA_EXPORT_VERSION,
  DATA_SCHEMA_VERSION,
  type CompletedTrip,
  type EcoRutaDataExport,
  type Favorite,
  type ImportStrategy,
  type ImportSummary,
} from './types';
import { isCompletedTrip, isFavorite } from './validation';

const DATABASE_NAME = 'ecoruta_local_data';

const upgrades = [
  {
    toVersion: 1,
    statements: [
      'CREATE TABLE IF NOT EXISTS favorites (id TEXT PRIMARY KEY NOT NULL, dedupe_key TEXT NOT NULL UNIQUE, kind TEXT NOT NULL, updated_at TEXT NOT NULL, payload TEXT NOT NULL);',
      'CREATE TABLE IF NOT EXISTS trips (id TEXT PRIMARY KEY NOT NULL, completed_at TEXT NOT NULL, mode TEXT NOT NULL, payload TEXT NOT NULL);',
    ],
  },
  {
    toVersion: 2,
    statements: [
      'CREATE INDEX IF NOT EXISTS favorites_kind_idx ON favorites(kind);',
      'CREATE INDEX IF NOT EXISTS favorites_updated_idx ON favorites(updated_at);',
      'CREATE INDEX IF NOT EXISTS trips_completed_idx ON trips(completed_at);',
      'CREATE INDEX IF NOT EXISTS trips_mode_idx ON trips(mode);',
    ],
  },
];

function parseRows<T>(rows: unknown[], guard: (value: unknown) => value is T, label: string) {
  return rows.map((row) => {
    const payload = typeof row === 'object' && row !== null ? (row as { payload?: unknown }).payload : undefined;
    if (typeof payload !== 'string') throw new EcoRutaStorageError('corrupt', `${label} contiene datos dañados.`);
    const value: unknown = JSON.parse(payload);
    if (!guard(value)) throw new EcoRutaStorageError('corrupt', `${label} contiene datos no válidos.`);
    return value;
  });
}

export class SQLiteEcoRutaRepository implements EcoRutaRepository {
  readonly engine = 'sqlite' as const;
  private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
  private connection: SQLiteDBConnection | null = null;

  async initialize() {
    if (this.connection) return;
    try {
      await this.sqlite.addUpgradeStatement(DATABASE_NAME, upgrades);
      const existing = await this.sqlite.isConnection(DATABASE_NAME, false);
      this.connection = existing.result
        ? await this.sqlite.retrieveConnection(DATABASE_NAME, false)
        : await this.sqlite.createConnection(DATABASE_NAME, false, 'no-encryption', DATA_SCHEMA_VERSION, false);
      await this.connection.open();
    } catch (error) {
      throw toStorageError(error);
    }
  }

  private async db() {
    await this.initialize();
    return this.connection!;
  }

  async listFavorites() {
    try {
      const result = await (await this.db()).query('SELECT payload FROM favorites ORDER BY updated_at DESC;');
      return parseRows(result.values ?? [], isFavorite, 'Favoritos');
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async putFavorite(favorite: Favorite) {
    if (!isFavorite(favorite)) throw new EcoRutaStorageError('validation', 'El favorito no contiene datos válidos.');
    try {
      const database = await this.db();
      const duplicate = await database.query('SELECT id FROM favorites WHERE dedupe_key = ? LIMIT 1;', [favorite.dedupeKey]);
      const duplicateId = (duplicate.values?.[0] as { id?: unknown } | undefined)?.id;
      if (typeof duplicateId === 'string' && duplicateId !== favorite.id) {
        throw new EcoRutaStorageError('duplicate', 'Este elemento ya está guardado.');
      }
      await database.run(
        `INSERT INTO favorites (id, dedupe_key, kind, updated_at, payload) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET dedupe_key = excluded.dedupe_key, kind = excluded.kind, updated_at = excluded.updated_at, payload = excluded.payload;`,
        [favorite.id, favorite.dedupeKey, favorite.kind, favorite.updatedAt, JSON.stringify(favorite)],
      );
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async deleteFavorite(id: string) { await (await this.db()).run('DELETE FROM favorites WHERE id = ?;', [id]); }
  async clearFavorites() { await (await this.db()).run('DELETE FROM favorites;'); }

  async listTrips() {
    try {
      const result = await (await this.db()).query('SELECT payload FROM trips ORDER BY completed_at DESC;');
      return parseRows(result.values ?? [], isCompletedTrip, 'Historial');
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async putTrip(trip: CompletedTrip) {
    if (!isCompletedTrip(trip)) throw new EcoRutaStorageError('validation', 'El recorrido no contiene datos válidos.');
    try {
      await (await this.db()).run(
        'INSERT OR REPLACE INTO trips (id, completed_at, mode, payload) VALUES (?, ?, ?, ?);',
        [trip.id, trip.completedAt, trip.mode, JSON.stringify(trip)],
      );
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async deleteTrip(id: string) { await (await this.db()).run('DELETE FROM trips WHERE id = ?;', [id]); }
  async clearTrips() { await (await this.db()).run('DELETE FROM trips;'); }
  async clearAll() {
    const database = await this.db();
    await database.executeTransaction([
      { statement: 'DELETE FROM favorites;', values: [] },
      { statement: 'DELETE FROM trips;', values: [] },
    ]);
  }

  async exportData(): Promise<EcoRutaDataExport> {
    const [favorites, trips] = await Promise.all([this.listFavorites(), this.listTrips()]);
    return {
      format: 'ecoruta-local-data',
      exportVersion: DATA_EXPORT_VERSION,
      schemaVersion: DATA_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      favorites,
      trips,
    };
  }

  async importData(data: EcoRutaDataExport, strategy: ImportStrategy): Promise<ImportSummary> {
    const database = await this.db();
    if (strategy === 'replace') await this.clearAll();
    let favorites = 0;
    let trips = 0;
    for (const favorite of data.favorites) {
      if (strategy === 'merge') {
        const duplicate = await database.query('SELECT id FROM favorites WHERE id = ? OR dedupe_key = ? LIMIT 1;', [favorite.id, favorite.dedupeKey]);
        if ((duplicate.values ?? []).length > 0) continue;
      }
      await this.putFavorite(favorite);
      favorites += 1;
    }
    for (const trip of data.trips) {
      if (strategy === 'merge') {
        const duplicate = await database.query('SELECT id FROM trips WHERE id = ? LIMIT 1;', [trip.id]);
        if ((duplicate.values ?? []).length > 0) continue;
      }
      await this.putTrip(trip);
      trips += 1;
    }
    return { favorites, trips };
  }

  async close() {
    if (!this.connection) return;
    await this.connection.close();
    await this.sqlite.closeConnection(DATABASE_NAME, false);
    this.connection = null;
  }
}

