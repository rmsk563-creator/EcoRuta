import { deleteDB, openDB, type DBSchema, type IDBPDatabase } from 'idb';
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

export const ECORUTA_DB_NAME = 'ecoruta-local-data';

interface EcoRutaDbSchema extends DBSchema {
  favorites: {
    key: string;
    value: Favorite;
    indexes: {
      'by-dedupe': string;
      'by-kind': Favorite['kind'];
      'by-updated-at': string;
    };
  };
  trips: {
    key: string;
    value: CompletedTrip;
    indexes: {
      'by-completed-at': string;
      'by-mode': CompletedTrip['mode'];
    };
  };
  metadata: {
    key: string;
    value: { key: string; value: string };
  };
}

export class IndexedDbEcoRutaRepository implements EcoRutaRepository {
  readonly engine = 'indexeddb' as const;
  private database: IDBPDatabase<EcoRutaDbSchema> | null = null;

  constructor(private readonly databaseName = ECORUTA_DB_NAME) {}

  async initialize() {
    if (this.database) return;
    if (!('indexedDB' in globalThis)) {
      throw new EcoRutaStorageError('unavailable', 'IndexedDB no está disponible en este navegador.');
    }
    try {
      this.database = await openDB<EcoRutaDbSchema>(this.databaseName, DATA_SCHEMA_VERSION, {
        upgrade(database, oldVersion, _newVersion, transaction) {
          if (oldVersion < 1) {
            const favorites = database.createObjectStore('favorites', { keyPath: 'id' });
            favorites.createIndex('by-dedupe', 'dedupeKey', { unique: true });
            const trips = database.createObjectStore('trips', { keyPath: 'id' });
            trips.createIndex('by-completed-at', 'completedAt');
            database.createObjectStore('metadata', { keyPath: 'key' });
          }
          if (oldVersion < 2) {
            const favorites = transaction.objectStore('favorites');
            if (!favorites.indexNames.contains('by-kind')) favorites.createIndex('by-kind', 'kind');
            if (!favorites.indexNames.contains('by-updated-at')) favorites.createIndex('by-updated-at', 'updatedAt');
            const trips = transaction.objectStore('trips');
            if (!trips.indexNames.contains('by-mode')) trips.createIndex('by-mode', 'mode');
          }
        },
        blocked() {
          throw new EcoRutaStorageError('unavailable', 'Cierra otras pestañas de EcoRuta para actualizar el almacenamiento.');
        },
      });
      await this.database.put('metadata', { key: 'schema-version', value: String(DATA_SCHEMA_VERSION) });
    } catch (error) {
      throw toStorageError(error);
    }
  }

  private async db() {
    await this.initialize();
    return this.database!;
  }

  async listFavorites() {
    try {
      const values = await (await this.db()).getAll('favorites');
      if (!values.every(isFavorite)) throw new EcoRutaStorageError('corrupt', 'Hay favoritos locales dañados.');
      return values.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async putFavorite(favorite: Favorite) {
    if (!isFavorite(favorite)) throw new EcoRutaStorageError('validation', 'El favorito no contiene datos válidos.');
    try {
      await (await this.db()).put('favorites', favorite);
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async deleteFavorite(id: string) {
    try {
      await (await this.db()).delete('favorites', id);
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async clearFavorites() {
    try {
      await (await this.db()).clear('favorites');
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async listTrips() {
    try {
      const values = await (await this.db()).getAll('trips');
      if (!values.every(isCompletedTrip)) throw new EcoRutaStorageError('corrupt', 'Hay recorridos locales dañados.');
      return values.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async putTrip(trip: CompletedTrip) {
    if (!isCompletedTrip(trip)) throw new EcoRutaStorageError('validation', 'El recorrido no contiene datos válidos.');
    try {
      await (await this.db()).put('trips', trip);
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async deleteTrip(id: string) {
    try {
      await (await this.db()).delete('trips', id);
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async clearTrips() {
    try {
      await (await this.db()).clear('trips');
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async clearAll() {
    try {
      const database = await this.db();
      const transaction = database.transaction(['favorites', 'trips'], 'readwrite');
      await Promise.all([transaction.objectStore('favorites').clear(), transaction.objectStore('trips').clear()]);
      await transaction.done;
    } catch (error) {
      throw toStorageError(error);
    }
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
    try {
      const database = await this.db();
      const transaction = database.transaction(['favorites', 'trips'], 'readwrite');
      const favoriteStore = transaction.objectStore('favorites');
      const tripStore = transaction.objectStore('trips');
      if (strategy === 'replace') {
        await favoriteStore.clear();
        await tripStore.clear();
      }
      let favorites = 0;
      let trips = 0;
      for (const favorite of data.favorites) {
        if (!isFavorite(favorite)) throw new EcoRutaStorageError('validation', 'La importación contiene un favorito inválido.');
        if (strategy === 'merge') {
          const duplicate = await favoriteStore.index('by-dedupe').get(favorite.dedupeKey);
          if (duplicate || await favoriteStore.get(favorite.id)) continue;
        }
        await favoriteStore.put(favorite);
        favorites += 1;
      }
      for (const trip of data.trips) {
        if (!isCompletedTrip(trip)) throw new EcoRutaStorageError('validation', 'La importación contiene un recorrido inválido.');
        if (strategy === 'merge' && await tripStore.get(trip.id)) continue;
        await tripStore.put(trip);
        trips += 1;
      }
      await transaction.done;
      return { favorites, trips };
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async close() {
    this.database?.close();
    this.database = null;
  }
}

export async function deleteEcoRutaDatabase(databaseName = ECORUTA_DB_NAME) {
  await deleteDB(databaseName);
}

