export interface Env {
  AI: Ai;
  FIREBASE_PROJECT_ID: string;
  ALLOWED_ORIGINS: string;
  RATE_LIMIT_PER_MINUTE: string;
  RATE_LIMIT_PER_DAY: string;
  RATE_LIMITER: DurableObjectNamespace;
}

export interface AuthenticatedUser {
  uid: string;
}

export type AssistantIntent = 'mobility_guidance' | 'destination_plan' | 'out_of_scope';

export interface AssistantAnswer {
  reply: string;
  intent: AssistantIntent;
  destinationQuery: string | null;
  requiresMapConfirmation: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingMinute: number;
  remainingDay: number;
  retryAfterSeconds: number;
}
