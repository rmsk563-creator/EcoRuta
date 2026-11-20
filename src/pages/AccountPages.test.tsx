import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RecoverAccountPage, RegisterPage, SignInPage, VerifyEmailPage } from './AccountPages';
import { AuthProvider } from '../state/AuthContext';
import type { AuthService, EcoRutaAuthUser } from '../services/auth/types';

const testUser: EcoRutaAuthUser = {
  uid: 'local-test-user',
  email: 'persona@example.com',
  displayName: 'Persona',
  emailVerified: false,
};

function createService() {
  const service: AuthService = {
    subscribe: vi.fn((listener) => {
      listener(null);
      return () => undefined;
    }),
    register: vi.fn(async () => ({ user: testUser, verificationSent: true })),
    signIn: vi.fn(async () => ({ ...testUser, emailVerified: true })),
    resendEmailVerification: vi.fn(async () => undefined),
    refreshUser: vi.fn(async () => ({ ...testUser, emailVerified: true })),
    getIdToken: vi.fn(async () => 'firebase-id-token'),
    sendPasswordReset: vi.fn(async () => undefined),
    signOut: vi.fn(async () => undefined),
  };
  return service;
}

function renderFlow(path: string, service: AuthService) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider configuredOverride serviceLoader={async () => service}>
        <Routes>
          <Route path="account/sign-in" element={<SignInPage />} />
          <Route path="account/register" element={<RegisterPage />} />
          <Route path="account/recover" element={<RecoverAccountPage />} />
          <Route path="account/verify" element={<VerifyEmailPage />} />
          <Route path="/" element={<h1>Mapa principal</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('Firebase account flows', () => {
  it('submits a real sign-in request and navigates after success', async () => {
    const user = userEvent.setup();
    const service = createService();
    renderFlow('/account/sign-in', service);

    await user.type(screen.getByLabelText('Correo electrónico'), 'persona@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Segura123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => expect(service.signIn).toHaveBeenCalledWith('persona@example.com', 'Segura123'));
    expect(await screen.findByRole('heading', { name: /mapa principal/i })).toBeInTheDocument();
  });

  it('validates confirmation and submits registration without persisting the password', async () => {
    const user = userEvent.setup();
    const service = createService();
    renderFlow('/account/register', service);

    await user.type(screen.getByLabelText('Nombre opcional'), 'Persona');
    await user.type(screen.getByLabelText('Correo electrónico'), 'persona@example.com');
    await user.type(screen.getByLabelText('Contraseña (mínimo 8 caracteres)'), 'Segura123');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Segura123');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => expect(service.register).toHaveBeenCalledWith({ email: 'persona@example.com', password: 'Segura123', displayName: 'Persona' }));
    expect(localStorage.getItem('Segura123')).toBeNull();
    expect(await screen.findByRole('heading', { name: /verifica tu correo/i })).toBeInTheDocument();
  });

  it('uses a non-enumerating success message for password recovery', async () => {
    const user = userEvent.setup();
    const service = createService();
    renderFlow('/account/recover', service);

    await user.type(screen.getByLabelText('Correo electrónico'), 'persona@example.com');
    await user.click(screen.getByRole('button', { name: /enviar enlace seguro/i }));

    await waitFor(() => expect(service.sendPasswordReset).toHaveBeenCalledWith('persona@example.com'));
    expect(screen.getByRole('status')).toHaveTextContent(/si existe una cuenta/i);
  });

  it('refreshes the Firebase user before accepting email verification', async () => {
    const user = userEvent.setup();
    const service = createService();
    service.subscribe = vi.fn((listener) => {
      listener(testUser);
      return () => undefined;
    });
    renderFlow('/account/verify', service);

    await screen.findByText('persona@example.com');
    await user.click(screen.getByRole('button', { name: /ya verifiqué/i }));

    await waitFor(() => expect(service.refreshUser).toHaveBeenCalledOnce());
    expect(await screen.findByRole('heading', { name: /mapa principal/i })).toBeInTheDocument();
  });

  it('blocks duplicate submissions while a request is pending', async () => {
    let resolveSignIn: ((value: EcoRutaAuthUser) => void) | undefined;
    const service = createService();
    service.signIn = vi.fn(() => new Promise<EcoRutaAuthUser>((resolve) => { resolveSignIn = resolve; }));
    renderFlow('/account/sign-in', service);

    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'persona@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Segura123' } });
    const form = screen.getByRole('button', { name: /iniciar sesión/i }).closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    fireEvent.submit(form!);

    await waitFor(() => expect(service.signIn).toHaveBeenCalledOnce());
    await act(async () => resolveSignIn?.({ ...testUser, emailVerified: true }));
    expect(await screen.findByRole('heading', { name: /mapa principal/i })).toBeInTheDocument();
  });
});
