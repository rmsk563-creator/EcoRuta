export type GeoapifyErrorCode =
  | 'configuration'
  | 'network'
  | 'quota'
  | 'rate_limit'
  | 'service'
  | 'timeout'
  | 'invalid_response'
  | 'no_route';

export class GeoapifyError extends Error {
  constructor(
    public readonly code: GeoapifyErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'GeoapifyError';
  }
}

export function getGeoapifyErrorMessage(error: unknown) {
  if (error instanceof GeoapifyError) return error.message;
  if (error instanceof DOMException && error.name === 'AbortError') return '';
  return 'No pudimos completar la solicitud. Revisa tu conexión e inténtalo nuevamente.';
}
