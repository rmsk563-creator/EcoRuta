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

  it('reports an expired Firebase session as authentication, not connectivity', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(
      { error: 'La sesión venció. Inicia sesión nuevamente.' },
      { status: 401 },
    )));
    await expect(sendEcoAiMessage('https://eco-ai.example.workers.dev', 'Hola', 'token')).rejects.toMatchObject({
      code: 'authentication',
      status: 401,
    });
  });

  it('preserves an authorization error returned by the Worker', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(
      { error: 'Origen no autorizado.' },
      { status: 403 },
    )));
    await expect(sendEcoAiMessage('https://eco-ai.example.workers.dev', 'Hola', 'token')).rejects.toMatchObject({
      code: 'authorization',
      status: 403,
      message: 'Origen no autorizado.',
    });
  });

  it('does not describe an opaque CORS or service failure as a confirmed internet outage', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(sendEcoAiMessage('https://eco-ai.example.workers.dev', 'Hola', 'token')).rejects.toMatchObject({
      code: 'network',
      message: expect.stringContaining('conexión segura'),
    });
  });

  it('reports a confirmed offline browser separately', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
    await expect(sendEcoAiMessage('https://eco-ai.example.workers.dev', 'Hola', 'token')).rejects.toMatchObject({
      code: 'network',
      message: expect.stringContaining('no tiene conexión a Internet'),
    });
    vi.restoreAllMocks();
  });

  it('reports a non-JSON server failure as service unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Error 1027</html>', {
      status: 503,
      headers: { 'Content-Type': 'text/html' },
    })));
    await expect(sendEcoAiMessage('https://eco-ai.example.workers.dev', 'Hola', 'token')).rejects.toMatchObject({
      code: 'service',
      status: 503,
    });
  });

  it('rejects malformed assistant output', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ answer: { reply: 'incompleta' } })));
    await expect(sendEcoAiMessage('https://eco-ai.example.workers.dev', 'Hola', 'token')).rejects.toMatchObject({ code: 'invalid-response' });
  });
});
