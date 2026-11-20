import { ECO_AI_SYSTEM_INSTRUCTION } from './prompt';
import type { AssistantAnswer } from './types';

export const WORKERS_AI_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast' as const;
const PROVIDER_TIMEOUT_MS = 15_000;

const ANSWER_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['reply', 'intent', 'destinationQuery', 'requiresMapConfirmation'],
  properties: {
    reply: { type: 'string' },
    intent: { type: 'string', enum: ['mobility_guidance', 'destination_plan', 'out_of_scope'] },
    destinationQuery: { type: ['string', 'null'] },
    requiresMapConfirmation: { type: 'boolean' },
  },
};

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

function extractStructuredAnswer(result: unknown): unknown {
  if (typeof result === 'string') return JSON.parse(result);
  if (!result || typeof result !== 'object') return result;
  const response = (result as { response?: unknown }).response;
  if (typeof response === 'string') return JSON.parse(response);
  return response ?? result;
}

function normalizeAnswer(value: unknown): AssistantAnswer {
  if (!isAssistantAnswer(value)) throw new ProviderError('Eco IA recibió una respuesta no válida.');
  const destinationQuery = value.intent === 'destination_plan'
    ? value.destinationQuery?.trim().slice(0, 160) || null
    : null;
  return {
    reply: value.reply.trim().slice(0, 1_200),
    intent: value.intent,
    destinationQuery,
    requiresMapConfirmation: Boolean(destinationQuery),
  };
}

function providerError(error: unknown): ProviderError {
  if (error instanceof ProviderError) return error;
  const provider = error as { status?: number; code?: number | string; message?: string };
  const code = String(provider.code ?? '');
  if (provider.status === 429 || ['3040', '5035'].includes(code) || /quota|capacity|rate limit/i.test(provider.message ?? '')) {
    return new ProviderError('Eco IA alcanzó temporalmente el límite gratuito. Inténtalo más tarde.', 429);
  }
  if (/JSON Mode couldn't be met/i.test(provider.message ?? '')) {
    return new ProviderError('Eco IA no pudo estructurar una respuesta segura. Inténtalo de otra forma.', 502);
  }
  return new ProviderError('Eco IA no está disponible en este momento.');
}

export async function askWorkersAi(message: string, ai: Ai): Promise<AssistantAnswer> {
  const inference = ai.run(WORKERS_AI_MODEL, {
    messages: [
      { role: 'system', content: ECO_AI_SYSTEM_INSTRUCTION },
      { role: 'user', content: message },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: ANSWER_SCHEMA,
    },
    max_tokens: 420,
    temperature: 0.2,
  });

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      inference,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new ProviderError('Eco IA tardó demasiado. Inténtalo nuevamente.', 504)), PROVIDER_TIMEOUT_MS);
      }),
    ]);
    return normalizeAnswer(extractStructuredAnswer(result));
  } catch (error) {
    throw providerError(error);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
