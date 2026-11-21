import { describe, expect, it } from 'vitest';
import { allowedOrigin } from './index';

const origins = 'capacitor://localhost,http://localhost:4191,http://localhost:5173,https://rmsk563-creator.github.io';

describe('allowedOrigin', () => {
  it('accepts the exact Vite development origin including its port', () => {
    const request = new Request('https://ecoruta-eco-ai.example/v1/chat', {
      headers: { Origin: 'http://localhost:4191' },
    });
    expect(allowedOrigin(request, origins)).toBe('http://localhost:4191');
  });

  it('rejects unlisted ports and lookalike origins', () => {
    for (const origin of ['http://localhost:4192', 'https://rmsk563-creator.github.io.example.com']) {
      const request = new Request('https://ecoruta-eco-ai.example/v1/chat', { headers: { Origin: origin } });
      expect(allowedOrigin(request, origins)).toBeUndefined();
    }
  });
});
