import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { AuthService, EcoRutaAuthUser } from '../services/auth/types';
import { AuthProvider } from '../state/AuthContext';
import { ProfilePage } from './ProfilePage';

const testUser: EcoRutaAuthUser = {
  uid: 'firebase-user',
  email: 'persona@example.com',
  displayName: 'Persona',
  emailVerified: true,
};

describe('Profile account isolation', () => {
  it('does not invent a name or email for guest access', () => {
    render(
      <MemoryRouter>
        <AuthProvider configuredOverride={false}>
          <ProfilePage />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /tu espacio en ecoruta/i })).toBeInTheDocument();
    expect(screen.getByText(/usas la aplicación sin una cuenta/i)).toBeInTheDocument();
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });

  it('shows real identity fields and signs out without touching mobility storage', async () => {
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
        <AuthProvider configuredOverride serviceLoader={async () => service}>
          <ProfilePage />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Persona' })).toBeInTheDocument();
    expect(screen.getByText('persona@example.com')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    await waitFor(() => expect(service.signOut).toHaveBeenCalledOnce());
    expect(screen.getByRole('status')).toHaveTextContent(/actividad local permanece/i);
  });
});
