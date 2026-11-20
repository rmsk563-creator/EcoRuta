import { describe, expect, it, vi } from 'vitest';
import { askWorkersAi, WORKERS_AI_MODEL } from './workersAi';

function aiReturning(response: unknown) {
  return { run: vi.fn().mockResolvedValue(response) } as unknown as Ai;
}

describe('askWorkersAi', () => {
  it('uses the selected multilingual model and sends only system plus current message', async () => {
    const ai = aiReturning({ response: JSON.stringify({
      reply: 'Puedo preparar ese destino en el mapa.',
      intent: 'destination_plan',
      destinationQuery: ' Parque Kennedy, Lima, Peru ',
      requiresMapConfirmation: false,
    }) });

    await expect(askWorkersAi('Quiero ir al Parque Kennedy caminando', ai)).resolves.toMatchObject({
      destinationQuery: 'Parque Kennedy, Lima, Peru',
      requiresMapConfirmation: true,
    });
    expect(ai.run).toHaveBeenCalledWith(WORKERS_AI_MODEL, expect.objectContaining({
      messages: [
        expect.objectContaining({ role: 'system' }),
        { role: 'user', content: 'Quiero ir al Parque Kennedy caminando' },
      ],
      response_format: expect.objectContaining({ type: 'json_schema' }),
    }));
  });

  it('accepts an object returned directly by JSON Mode', async () => {
    const ai = aiReturning({ response: {
      reply: 'Caminar es una opción de movilidad activa.',
      intent: 'mobility_guidance',
      destinationQuery: 'valor inesperado',
      requiresMapConfirmation: true,
    } });

    await expect(askWorkersAi('¿Por qué caminar?', ai)).resolves.toMatchObject({
      destinationQuery: null,
      requiresMapConfirmation: false,
    });
  });

  it('rejects malformed output instead of exposing untrusted model data', async () => {
    const ai = aiReturning({ response: '{"reply":"sin esquema"}' });
    await expect(askWorkersAi('Hola', ai)).rejects.toThrow('respuesta no válida');
  });

  it('turns provider capacity errors into a clear free-limit response', async () => {
    const ai = { run: vi.fn().mockRejectedValue({ code: 3040, message: 'Out of capacity' }) } as unknown as Ai;
    await expect(askWorkersAi('Hola', ai)).rejects.toMatchObject({ status: 429 });
  });
});
