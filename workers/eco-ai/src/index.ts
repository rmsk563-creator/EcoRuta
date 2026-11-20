import { authenticateRequest, AuthenticationError } from './auth';
import { askGemini, ProviderError } from './gemini';
import { UserRateLimiter } from './rateLimiter';
import { parseChatRequest, RequestValidationError } from './request';
import type { Env, RateLimitResult } from './types';

export { UserRateLimiter };

const MAX_BODY_BYTES = 4_096;

function securityHeaders(origin?: string): HeadersInit {
  return {
    ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  };
}

function json(body: unknown, status: number, origin?: string, extraHeaders?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...securityHeaders(origin), ...extraHeaders },
  });
}

function allowedOrigin(request: Request, configuredOrigins: string): string | undefined {
  const origin = request.headers.get('Origin');
  if (!origin) return undefined;
  const allowed = configuredOrigins.split(',').map((item) => item.trim()).filter(Boolean);
  return allowed.includes(origin) ? origin : undefined;
}

function readPositiveInteger(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function hashUid(uid: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(uid));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function applyRateLimit(env: Env, uid: string): Promise<RateLimitResult> {
  const anonymizedUid = await hashUid(uid);
  const id = env.RATE_LIMITER.idFromName(anonymizedUid);
  const stub = env.RATE_LIMITER.get(id);
  const response = await stub.fetch('https://rate-limit.internal/consume', {
    method: 'POST',
    body: JSON.stringify({
      nowMs: Date.now(),
      perMinute: readPositiveInteger(env.RATE_LIMIT_PER_MINUTE, 6),
      perDay: readPositiveInteger(env.RATE_LIMIT_PER_DAY, 40),
    }),
  });
  return response.json<RateLimitResult>();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const requestOrigin = request.headers.get('Origin') ?? undefined;
    const origin = allowedOrigin(request, env.ALLOWED_ORIGINS);

    if (requestOrigin && !origin) return json({ error: 'Origen no autorizado.' }, 403);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Max-Age': '600',
        },
      });
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ status: 'ok', service: 'ecoruta-eco-ai' }, 200, origin);
    }

    if (request.method !== 'POST' || url.pathname !== '/v1/chat') {
      return json({ error: 'Ruta no disponible.' }, 404, origin);
    }

    try {
      const rawBody = await request.text();
      if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
        return json({ error: 'La solicitud es demasiado grande.' }, 413, origin);
      }
      const user = await authenticateRequest(request, env.FIREBASE_PROJECT_ID);
      const payload = parseChatRequest(JSON.parse(rawBody));
      const limit = await applyRateLimit(env, user.uid);

      const rateHeaders = {
        'X-RateLimit-Remaining-Minute': String(limit.remainingMinute),
        'X-RateLimit-Remaining-Day': String(limit.remainingDay),
      };
      if (!limit.allowed) {
        return json(
          { error: 'Has alcanzado el límite temporal de Eco IA. Inténtalo más tarde.' },
          429,
          origin,
          { ...rateHeaders, 'Retry-After': String(limit.retryAfterSeconds) },
        );
      }

      const answer = await askGemini(payload.message, env.GEMINI_API_KEY, env.GEMINI_MODEL);
      return json({ answer }, 200, origin, rateHeaders);
    } catch (error) {
      if (error instanceof AuthenticationError) return json({ error: error.message }, 401, origin);
      if (error instanceof RequestValidationError || error instanceof SyntaxError) {
        return json({ error: error instanceof Error ? error.message : 'La solicitud no es válida.' }, 400, origin);
      }
      if (error instanceof ProviderError) return json({ error: error.message }, error.status, origin);
      return json({ error: 'Eco IA no está disponible en este momento.' }, 500, origin);
    }
  },
};
