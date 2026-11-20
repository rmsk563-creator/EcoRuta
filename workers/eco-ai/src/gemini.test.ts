import { afterEach, describe, expect, it, vi } from 'vitest';
import { askGemini } from './gemini';

afterEach(() => vi.unstubAllGlobals());

describe('askGemini', () => {
  it('normalizes destination proposals for explicit map confirmation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
      candidates: [{ content: { parts: [{ text: JSON.stringify({
        reply: 'Puedo preparar ese destino en el mapa.',
        intent: 'destination_plan',
        destinationQuery: ' Parque Kennedy, Lima, Peru ',
        requiresMapConfirmation: false,
      }) }] } }],
    })));

    await expect(askGemini('Quiero ir al Parque Kennedy', 'test-key', 'test-model')).resolves.toMatchObject({
      destinationQuery: 'Parque Kennedy, Lima, Peru',
      requiresMapConfirmation: true,
    });
  });

  it('removes an unexpected destination from non-planning answers', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
      candidates: [{ content: { parts: [{ text: JSON.stringify({
        reply: 'Caminar es una opción de movilidad activa.',
        intent: 'mobility_guidance',
        destinationQuery: 'valor inesperado',
        requiresMapConfirmation: true,
      }) }] } }],
    })));

    await expect(askGemini('¿Por qué caminar?', 'test-key', 'test-model')).resolves.toMatchObject({
      destinationQuery: null,
      requiresMapConfirmation: false,
    });
  });
});
