import { ECO_AI_SYSTEM_INSTRUCTION } from './prompt';
import type { AssistantAnswer } from './types';

const GEMINI_TIMEOUT_MS = 12_000;

export class ProviderError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message);
  }
}

function isAssistantAnswer(value: unknown): value is AssistantAnswer {
  if (!value || typeof value !== 'object') return false;
  const answer = value as Partial<AssistantAnswer>;
  return typeof answer.reply === 'string'
    && answer.reply.trim().length > 0
    && ['mobility_guidance', 'destination_plan', 'out_of_scope'].includes(answer.intent ?? '')
    && (answer.destinationQuery === null || typeof answer.destinationQuery === 'string')
    && typeof answer.requiresMapConfirmation === 'boolean';
}

export async function askGemini(message: string, apiKey: string, model: string): Promise<AssistantAnswer> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: ECO_AI_SYSTEM_INSTRUCTION }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 420,
            responseMimeType: 'application/json',
            responseJsonSchema: {
              type: 'object',
              additionalProperties: false,
              required: ['reply', 'intent', 'destinationQuery', 'requiresMapConfirmation'],
              properties: {
                reply: { type: 'string' },
                intent: { type: 'string', enum: ['mobility_guidance', 'destination_plan', 'out_of_scope'] },
                destinationQuery: { type: ['string', 'null'] },
                requiresMapConfirmation: { type: 'boolean' },
              },
            },
          },
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      if (response.status === 429) throw new ProviderError('Eco IA alcanzó temporalmente el límite del proveedor.', 429);
      throw new ProviderError('Eco IA no pudo obtener una respuesta del proveedor.');
    }

    const data = await response.json<{
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    }>();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new ProviderError('Eco IA recibió una respuesta vacía.');
    const answer: unknown = JSON.parse(text);
    if (!isAssistantAnswer(answer)) throw new ProviderError('Eco IA recibió una respuesta no válida.');

    const destinationQuery = answer.intent === 'destination_plan'
      ? answer.destinationQuery?.trim().slice(0, 160) || null
      : null;
    return {
      ...answer,
      reply: answer.reply.trim().slice(0, 1_200),
      destinationQuery,
      requiresMapConfirmation: Boolean(destinationQuery),
    };
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ProviderError('Eco IA tardó demasiado. Inténtalo nuevamente.', 504);
    }
    throw new ProviderError('Eco IA no pudo procesar la respuesta del proveedor.');
  } finally {
    clearTimeout(timeout);
  }
}
