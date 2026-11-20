import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendEcoAiMessage } from './client';

afterEach(() => vi.unstubAllGlobals());

describe('sendEcoAiMessage', () => {
  it('sends only the current message with the Firebase bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      answer: {
        reply: 'Puedo preparar Parque Kennedy en el mapa.',
        intent: 'destination_plan',
        destinationQuery: 'Parque Kennedy, Lima, Perú',
        requiresMapConfirmation: true,
      },
    }));
    vi.stubGlobal('fetch', fetchMock);

    await sendEcoAiMessage('https://eco-ai.example.workers.dev', 'Quiero ir caminando', 'firebase-token');

    expect(fetchMock).toHaveBeenCalledWith('https://eco-ai.example.workers.dev/v1/chat', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer firebase-token' }),
      body: JSON.stringify({ message: 'Quiero ir caminando' }),
    }));
  });

  it('reports the free limit without inventing a response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(
      { error: 'Has alcanzado el límite temporal de Eco IA.' },
      { status: 429 },
    )));
    await expect(sendEcoAiMessage('https://eco-ai.example.workers.dev', 'Hola', 'token')).rejects.toMatchObject({ code: 'limit' });
  });

  it('rejects malformed assistant output', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ answer: { reply: 'incompleta' } })));
    await expect(sendEcoAiMessage('https://eco-ai.example.workers.dev', 'Hola', 'token')).rejects.toMatchObject({ code: 'invalid-response' });
  });
});
