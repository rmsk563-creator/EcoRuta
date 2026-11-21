import { EcoAiError, type EcoAiAnswer } from './types';

const REQUEST_TIMEOUT_MS = 18_000;

function isAnswer(value: unknown): value is EcoAiAnswer {
  if (!value || typeof value !== 'object') return false;
  const answer = value as Partial<EcoAiAnswer>;
  return typeof answer.reply === 'string'
    && answer.reply.trim().length > 0
    && ['mobility_guidance', 'destination_plan', 'out_of_scope'].includes(answer.intent ?? '')
    && (answer.destinationQuery === null || typeof answer.destinationQuery === 'string')
    && typeof answer.requiresMapConfirmation === 'boolean';
}

function linkAbortSignal(source: AbortSignal | undefined, target: AbortController) {
  if (!source) return () => undefined;
  const abort = () => target.abort();
  if (source.aborted) target.abort();
  else source.addEventListener('abort', abort, { once: true });
  return () => source.removeEventListener('abort', abort);
}

async function readPayload(response: Response): Promise<{ answer?: unknown; error?: unknown }> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as { answer?: unknown; error?: unknown };
  } catch {
    if (!response.ok) return {};
    throw new EcoAiError('invalid-response', 'Eco IA recibió una respuesta que no pudo interpretar.');
  }
}

export async function sendEcoAiMessage(apiUrl: string, message: string, idToken: string, signal?: AbortSignal): Promise<EcoAiAnswer> {
  if (!apiUrl) throw new EcoAiError('configuration', 'Eco IA todavía no está conectada en este dispositivo.');
  const controller = new AbortController();
  const unlink = linkAbortSignal(signal, controller);
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiUrl}/v1/chat`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });
    const payload = await readPayload(response);
    const serverMessage = typeof payload.error === 'string' ? payload.error : '';

    if (response.status === 400 || response.status === 413) {
      throw new EcoAiError('validation', serverMessage || 'El mensaje no pudo procesarse. Revísalo e inténtalo nuevamente.', response.status);
    }
    if (response.status === 401) throw new EcoAiError('authentication', serverMessage || 'Tu sesión venció. Inicia sesión nuevamente.', 401);
    if (response.status === 403) throw new EcoAiError('authorization', serverMessage || 'Esta versión de EcoRuta no está autorizada para usar Eco IA.', 403);
    if (response.status === 429) throw new EcoAiError('limit', serverMessage || 'Eco IA alcanzó temporalmente el límite gratuito.', 429);
    if (response.status >= 500) throw new EcoAiError('service', serverMessage || 'Eco IA no está disponible en este momento.', response.status);
    if (!response.ok) throw new EcoAiError('service', serverMessage || 'Eco IA no pudo procesar el mensaje.', response.status);
    if (!isAnswer(payload.answer)) throw new EcoAiError('invalid-response', 'Eco IA recibió una respuesta no válida.');
    return payload.answer;
  } catch (error) {
    if (error instanceof EcoAiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      if (signal?.aborted) throw error;
      throw new EcoAiError('timeout', 'Eco IA tardó demasiado. Comprueba tu conexión e inténtalo nuevamente.');
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new EcoAiError('network', 'Tu dispositivo no tiene conexión a Internet. Conéctate e inténtalo nuevamente.');
    }
    throw new EcoAiError('network', 'Eco IA no pudo establecer una conexión segura. El servicio puede estar temporalmente inaccesible o esta versión puede necesitar una actualización.');
  } finally {
    window.clearTimeout(timeout);
    unlink();
  }
}
