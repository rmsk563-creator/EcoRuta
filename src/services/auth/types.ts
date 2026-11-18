export interface EcoRutaAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface RegisterResult {
  user: EcoRutaAuthUser;
  verificationSent: boolean;
}

export interface AuthService {
  subscribe: (listener: (user: EcoRutaAuthUser | null) => void) => () => void;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  signIn: (email: string, password: string) => Promise<EcoRutaAuthUser>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export type AuthServiceLoader = () => Promise<AuthService>;
