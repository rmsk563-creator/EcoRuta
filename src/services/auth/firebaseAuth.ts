import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  indexedDBLocalPersistence,
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth';
import { publicFirebaseConfig } from '../../config/firebase';
import type { AuthService, EcoRutaAuthUser } from './types';

let authInstance: Auth | null = null;

function normalizeUser(user: User): EcoRutaAuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
  };
}

function getFirebaseAuth() {
  if (authInstance) return authInstance;
  const app = getApps().length ? getApp() : initializeApp(publicFirebaseConfig);
  try {
    authInstance = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    });
  } catch (error) {
    if ((error as { code?: string }).code !== 'auth/already-initialized') throw error;
    authInstance = getAuth(app);
  }
  return authInstance;
}

export async function loadFirebaseAuthService(): Promise<AuthService> {
  const auth = getFirebaseAuth();

  return {
    subscribe(listener) {
      return onAuthStateChanged(auth, (user) => listener(user ? normalizeUser(user) : null));
    },
    async register({ email, password, displayName }) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const trimmedName = displayName?.trim();
      if (trimmedName) await updateProfile(credential.user, { displayName: trimmedName.slice(0, 60) });
      let verificationSent = true;
      try {
        await sendEmailVerification(credential.user);
      } catch {
        verificationSent = false;
      }
      return { user: normalizeUser(credential.user), verificationSent };
    },
    async signIn(email, password) {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return normalizeUser(credential.user);
    },
    async resendEmailVerification() {
      const user = auth.currentUser;
      if (!user) throw { code: 'auth/requires-recent-login' };
      if (!user.emailVerified) await sendEmailVerification(user);
    },
    async refreshUser() {
      const user = auth.currentUser;
      if (!user) return null;
      await reload(user);
      return normalizeUser(user);
    },
    async getIdToken() {
      const user = auth.currentUser;
      if (!user) throw { code: 'auth/requires-recent-login' };
      return user.getIdToken();
    },
    async sendPasswordReset(email) {
      await sendPasswordResetEmail(auth, email);
    },
    async signOut() {
      await firebaseSignOut(auth);
    },
  };
}
