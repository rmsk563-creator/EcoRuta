import { describe, expect, it } from 'vitest';
import { consumeRateLimit } from './rateLimiter';

describe('consumeRateLimit', () => {
  it('enforces the minute limit without consuming a rejected request', () => {
    const limits = { perMinute: 2, perDay: 5 };
    const first = consumeRateLimit(undefined, 1_000, limits);
    const second = consumeRateLimit(first.state, 2_000, limits);
    const rejected = consumeRateLimit(second.state, 3_000, limits);

    expect(first.result.allowed).toBe(true);
    expect(second.result.allowed).toBe(true);
    expect(rejected.result.allowed).toBe(false);
    expect(rejected.result.remainingDay).toBe(3);
    expect(rejected.state).toEqual(second.state);
  });

  it('resets minute counters independently and preserves the daily count', () => {
    const limits = { perMinute: 1, perDay: 2 };
    const first = consumeRateLimit(undefined, 1_000, limits);
    const nextMinute = consumeRateLimit(first.state, 61_000, limits);
    const dailyRejected = consumeRateLimit(nextMinute.state, 121_000, limits);

    expect(nextMinute.result.allowed).toBe(true);
    expect(dailyRejected.result.allowed).toBe(false);
    expect(dailyRejected.result.remainingDay).toBe(0);
  });
});
