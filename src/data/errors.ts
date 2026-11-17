export type StorageErrorCode = 'unavailable' | 'quota' | 'corrupt' | 'duplicate' | 'validation' | 'unknown';

export class EcoRutaStorageError extends Error {
  constructor(
    public readonly code: StorageErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'EcoRutaStorageError';
  }
}

export function toStorageError(error: unknown): EcoRutaStorageError {
  if (error instanceof EcoRutaStorageError) return error;
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError') {
      return new EcoRutaStorageError('quota', 'No hay espacio suficiente para guardar más datos locales.', error);
    }
    if (['InvalidStateError', 'NotSupportedError', 'SecurityError'].includes(error.name)) {
      return new EcoRutaStorageError('unavailable', 'El almacenamiento local no está disponible en este dispositivo.', error);
    }
    if (error.name === 'ConstraintError') {
      return new EcoRutaStorageError('duplicate', 'Este elemento ya está guardado.', error);
    }
  }
  if (error instanceof Error && /constraint|unique/i.test(error.message)) {
    return new EcoRutaStorageError('duplicate', 'Este elemento ya está guardado.', error);
  }
  return new EcoRutaStorageError('unknown', 'No se pudo completar la operación de almacenamiento.', error);
}

