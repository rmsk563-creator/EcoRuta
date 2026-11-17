import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EcoRutaDataExport } from '../../data/types';

const nativeState = vi.hoisted(() => ({ value: false }));
const browserOpen = vi.hoisted(() => vi.fn());
const writeFile = vi.hoisted(() => vi.fn(async () => ({ uri: 'file:///tmp/ecoruta.json' })));
const deleteFile = vi.hoisted(() => vi.fn(async () => undefined));
const canShare = vi.hoisted(() => vi.fn(async () => ({ value: true })));
const share = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => nativeState.value } }));
vi.mock('@capacitor/browser', () => ({ Browser: { open: browserOpen } }));
vi.mock('@capacitor/filesystem', () => ({
  Directory: { Cache: 'CACHE' },
  Encoding: { UTF8: 'utf8' },
  Filesystem: { writeFile, deleteFile },
}));
vi.mock('@capacitor/share', () => ({ Share: { canShare, share } }));

import { exportEcoRutaData } from './dataTransfer';
import { isAllowedExternalUrl, openExternalUrl } from './externalLinks';

const exported: EcoRutaDataExport = {
  format: 'ecoruta-local-data',
  exportVersion: 1,
  schemaVersion: 2,
  exportedAt: '2026-11-17T12:00:00.000Z',
  favorites: [],
  trips: [],
};

describe('adaptadores nativos', () => {
  beforeEach(() => {
    nativeState.value = false;
    vi.clearAllMocks();
  });

  it('solo permite enlaces HTTPS', () => {
    expect(isAllowedExternalUrl('https://www.geoapify.com/')).toBe(true);
    expect(isAllowedExternalUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedExternalUrl('http://example.com')).toBe(false);
  });

  it('abre enlaces externos con el navegador nativo', async () => {
    nativeState.value = true;
    await openExternalUrl('https://www.geoapify.com/');
    expect(browserOpen).toHaveBeenCalledWith({ url: 'https://www.geoapify.com/', presentationStyle: 'fullscreen' });
  });

  it('exporta JSON a caché, abre compartir y elimina el temporal en iOS', async () => {
    nativeState.value = true;
    await exportEcoRutaData(exported, new Date('2026-11-17T12:00:00.000Z'));

    expect(writeFile).toHaveBeenCalledWith(expect.objectContaining({
      path: 'ecoruta-datos-2026-11-17.json',
      data: JSON.stringify(exported, null, 2),
      directory: 'CACHE',
    }));
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ files: ['file:///tmp/ecoruta.json'] }));
    expect(deleteFile).toHaveBeenCalledWith({ path: 'ecoruta-datos-2026-11-17.json', directory: 'CACHE' });
  });
});
