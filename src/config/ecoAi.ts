function normalizeApiUrl(value: string | undefined) {
  const candidate = value?.trim();
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    const localDevelopment = import.meta.env.DEV && ['localhost', '127.0.0.1'].includes(url.hostname);
    if (url.protocol !== 'https:' && !(localDevelopment && url.protocol === 'http:')) return '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

export const ecoAiApiUrl = normalizeApiUrl(import.meta.env.VITE_ECO_AI_API_URL);
export const isEcoAiConfigured = Boolean(ecoAiApiUrl);
