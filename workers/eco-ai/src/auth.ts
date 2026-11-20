import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { AuthenticatedUser } from './types';

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
);

export class AuthenticationError extends Error {}

export function validateFirebaseClaims(payload: JWTPayload, projectId: string, nowSeconds = Math.floor(Date.now() / 1000)): AuthenticatedUser {
  if (!payload.sub || payload.sub.length > 128) throw new AuthenticationError('La sesión de Firebase no es válida.');
  if (payload.aud !== projectId) throw new AuthenticationError('La sesión no pertenece a EcoRuta.');
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new AuthenticationError('El emisor de la sesión no es válido.');
  if (typeof payload.exp !== 'number' || payload.exp <= nowSeconds) throw new AuthenticationError('La sesión venció. Inicia sesión nuevamente.');
  if (typeof payload.iat !== 'number' || payload.iat > nowSeconds + 60) throw new AuthenticationError('La fecha de la sesión no es válida.');
  if (typeof payload.auth_time !== 'number' || payload.auth_time > nowSeconds + 60) throw new AuthenticationError('La autenticación no es válida.');
  if (payload.email_verified !== true) throw new AuthenticationError('Verifica tu correo antes de usar Eco IA.');
  return { uid: payload.sub };
}

export async function authenticateRequest(request: Request, projectId: string): Promise<AuthenticatedUser> {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) throw new AuthenticationError('Inicia sesión para usar Eco IA.');
  const token = authorization.slice('Bearer '.length).trim();
  if (!token) throw new AuthenticationError('Inicia sesión para usar Eco IA.');

  try {
    const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    });
    return validateFirebaseClaims(payload, projectId);
  } catch (error) {
    if (error instanceof AuthenticationError) throw error;
    throw new AuthenticationError('La sesión no pudo verificarse. Inicia sesión nuevamente.');
  }
}
