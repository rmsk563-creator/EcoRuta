import type { RateLimitResult } from './types';

interface CounterState {
  minuteWindow: number;
  minuteCount: number;
  dayWindow: number;
  dayCount: number;
}

interface LimitConfig {
  perMinute: number;
  perDay: number;
}

export function consumeRateLimit(previous: CounterState | undefined, nowMs: number, limits: LimitConfig): { state: CounterState; result: RateLimitResult } {
  const minuteWindow = Math.floor(nowMs / 60_000);
  const dayWindow = Math.floor(nowMs / 86_400_000);
  const state: CounterState = previous
    ? { ...previous }
    : { minuteWindow, minuteCount: 0, dayWindow, dayCount: 0 };

  if (state.minuteWindow !== minuteWindow) {
    state.minuteWindow = minuteWindow;
    state.minuteCount = 0;
  }
  if (state.dayWindow !== dayWindow) {
    state.dayWindow = dayWindow;
    state.dayCount = 0;
  }

  const minuteExceeded = state.minuteCount >= limits.perMinute;
  const dayExceeded = state.dayCount >= limits.perDay;
  if (minuteExceeded || dayExceeded) {
    const nextMinute = (minuteWindow + 1) * 60_000;
    const nextDay = (dayWindow + 1) * 86_400_000;
    const retryAt = dayExceeded ? nextDay : nextMinute;
    return {
      state,
      result: {
        allowed: false,
        remainingMinute: Math.max(0, limits.perMinute - state.minuteCount),
        remainingDay: Math.max(0, limits.perDay - state.dayCount),
        retryAfterSeconds: Math.max(1, Math.ceil((retryAt - nowMs) / 1000)),
      },
    };
  }

  state.minuteCount += 1;
  state.dayCount += 1;
  return {
    state,
    result: {
      allowed: true,
      remainingMinute: Math.max(0, limits.perMinute - state.minuteCount),
      remainingDay: Math.max(0, limits.perDay - state.dayCount),
      retryAfterSeconds: 0,
    },
  };
}

export class UserRateLimiter {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const input = await request.json<{ nowMs: number; perMinute: number; perDay: number }>();
    const previous = await this.state.storage.get<CounterState>('counter');
    const { state, result } = consumeRateLimit(previous, input.nowMs, {
      perMinute: input.perMinute,
      perDay: input.perDay,
    });
    if (result.allowed) await this.state.storage.put('counter', state);
    return Response.json(result);
  }
}
