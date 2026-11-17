import { describe, expect, it } from 'vitest';
import { EcoRutaStorageError, toStorageError } from './errors';

describe('storage errors', () => {
  it('maps quota and duplicate failures to comprehensible errors', () => {
    expect(toStorageError(new DOMException('full', 'QuotaExceededError'))).toMatchObject({ code: 'quota' });
    expect(toStorageError(new DOMException('duplicate', 'ConstraintError'))).toMatchObject({ code: 'duplicate' });
  });

  it('preserves validated storage errors', () => {
    const error = new EcoRutaStorageError('validation', 'Archivo inválido');
    expect(toStorageError(error)).toBe(error);
  });
});
