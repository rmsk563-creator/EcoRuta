import { Capacitor } from '@capacitor/core';
import type { EcoRutaRepository } from './repository';

export async function createEcoRutaRepository(): Promise<EcoRutaRepository> {
  if (Capacitor.isNativePlatform()) {
    const { SQLiteEcoRutaRepository } = await import('./sqliteRepository');
    return new SQLiteEcoRutaRepository();
  }
  const { IndexedDbEcoRutaRepository } = await import('./indexedDbRepository');
  return new IndexedDbEcoRutaRepository();
}

