const MAX_MESSAGE_LENGTH = 800;
const ALLOWED_KEYS = new Set(['message']);

export class RequestValidationError extends Error {}

export function parseChatRequest(value: unknown): { message: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new RequestValidationError('La solicitud debe ser un objeto JSON.');
  }

  const record = value as Record<string, unknown>;
  const unknownKeys = Object.keys(record).filter((key) => !ALLOWED_KEYS.has(key));
  if (unknownKeys.length > 0) {
    throw new RequestValidationError('La solicitud contiene datos no permitidos.');
  }

  if (typeof record.message !== 'string') {
    throw new RequestValidationError('Escribe un mensaje para Eco IA.');
  }

  const message = record.message.trim();
  if (!message) throw new RequestValidationError('Escribe un mensaje para Eco IA.');
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new RequestValidationError(`El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres.`);
  }

  return { message };
}
