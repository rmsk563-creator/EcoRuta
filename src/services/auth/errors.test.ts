import { getAuthErrorMessage } from './errors';

describe('Firebase error privacy', () => {
  it('does not reveal whether an email is registered', () => {
    const unknown = getAuthErrorMessage({ code: 'auth/user-not-found' });
    const existing = getAuthErrorMessage({ code: 'auth/email-already-in-use' });
    expect(existing).toBe(unknown);
    expect(existing).not.toMatch(/registrad|exist/i);
  });

  it('translates rate limits and network errors', () => {
    expect(getAuthErrorMessage({ code: 'auth/too-many-requests' })).toMatch(/demasiados intentos/i);
    expect(getAuthErrorMessage({ code: 'auth/network-request-failed' })).toMatch(/conexión/i);
  });
});
