import { describe, expect, it } from 'vitest';
import { parseChatRequest, RequestValidationError } from './request';

describe('parseChatRequest', () => {
  it('accepts only the current trimmed message', () => {
    expect(parseChatRequest({ message: '  Quiero ir al Parque Kennedy caminando  ' })).toEqual({
      message: 'Quiero ir al Parque Kennedy caminando',
    });
  });

  it.each([
    { message: 'Hola', latitude: -12.12, longitude: -77.03 },
    { message: 'Hola', history: [{ role: 'user', content: 'Anterior' }] },
    { message: 'Hola', email: 'persona@example.com' },
  ])('rejects extra personal, location, or history fields', (payload) => {
    expect(() => parseChatRequest(payload)).toThrow(RequestValidationError);
  });

  it('rejects empty and oversized messages', () => {
    expect(() => parseChatRequest({ message: '   ' })).toThrow('Escribe un mensaje');
    expect(() => parseChatRequest({ message: 'x'.repeat(801) })).toThrow('800 caracteres');
  });
});
