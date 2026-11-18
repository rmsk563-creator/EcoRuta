import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { AuthService, EcoRutaAuthUser } from '../services/auth/types';
import { AuthProvider } from '../state/AuthContext';
import { PreferencesProvider } from '../state/PreferencesContext';
import { SettingsPage } from './SettingsPage';

const clearFavorites = vi.fn(async () => undefined);
const clearTrips = vi.fn(async () => undefined);
const clearAll = vi.fn(async () => undefined);

vi.mock('../state/DataContext', () => ({
  useEcoRutaData: () => ({
    ready: true,
    engine: 'indexeddb',
    error: '',
    clearFavorites,
    clearTrips,
    clearAll,
    exportData: vi.fn(),
    importData: vi.fn(),
  }),
}));

const testUser: EcoRutaAuthUser = {
  uid: 'firebase-user',
  email: 'persona@example.com',
  displayName: 'Persona',
  emailVerified: true,
};

describe('Settings account isolation', () => {
  it('signs out without clearing local mobility data', async () => {
    const service: AuthService = {
      subscribe: vi.fn((listener) => {
        listener(testUser);
        return () => undefined;
      }),
      register: vi.fn(),
      signIn: vi.fn(),
      sendPasswordReset: vi.fn(),
      signOut: vi.fn(async () => undefined),
    };
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PreferencesProvider>
          <AuthProvider configuredOverride serviceLoader={async () => service}>
            <SettingsPage />
          </AuthProvider>
        </PreferencesProvider>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('button', { name: /cerrar sesión/i }));

    await waitFor(() => expect(service.signOut).toHaveBeenCalledOnce());
    expect(clearFavorites).not.toHaveBeenCalled();
    expect(clearTrips).not.toHaveBeenCalled();
    expect(clearAll).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent(/permanecen en este dispositivo/i);
  });
});
