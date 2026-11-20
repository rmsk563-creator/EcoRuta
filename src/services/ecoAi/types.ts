export type EcoAiIntent = 'mobility_guidance' | 'destination_plan' | 'out_of_scope';

export interface EcoAiAnswer {
  reply: string;
  intent: EcoAiIntent;
  destinationQuery: string | null;
  requiresMapConfirmation: boolean;
}

export type EcoAiErrorCode = 'authentication' | 'limit' | 'configuration' | 'timeout' | 'network' | 'service' | 'invalid-response';

export class EcoAiError extends Error {
  constructor(readonly code: EcoAiErrorCode, message: string, readonly status?: number) {
    super(message);
  }
}
