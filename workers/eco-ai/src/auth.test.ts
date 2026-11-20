import { describe, expect, it } from 'vitest';
import { validateFirebaseClaims } from './auth';

const projectId = 'ecoruta-web-90b6d';
const now = 1_800_000_000;

function claims(overrides: Record<string, unknown> = {}) {
  return {
    sub: 'firebase-user',
    aud: projectId,
    iss: `https://securetoken.google.com/${projectId}`,
    exp: now + 3_600,
    iat: now - 60,
    auth_time: now - 60,
    email_verified: true,
    ...overrides,
  };
}

describe('validateFirebaseClaims', () => {
  it('accepts a current verified EcoRuta user', () => {
    expect(validateFirebaseClaims(claims(), projectId, now)).toEqual({ uid: 'firebase-user' });
  });

  it('rejects the wrong project, expired tokens, and unverified email', () => {
    expect(() => validateFirebaseClaims(claims({ aud: 'otro-proyecto' }), projectId, now)).toThrow();
    expect(() => validateFirebaseClaims(claims({ exp: now }), projectId, now)).toThrow('venció');
    expect(() => validateFirebaseClaims(claims({ email_verified: false }), projectId, now)).toThrow('Verifica tu correo');
  });
});
