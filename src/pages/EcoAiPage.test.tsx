import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import type { AuthService, EcoRutaAuthUser } from '../services/auth/types';
import { searchLimaPlaces } from '../services/geoapify/client';
import { AuthProvider } from '../state/AuthContext';
import { EcoAiPage } from './EcoAiPage';

vi.mock('../services/geoapify/client', () => ({ searchLimaPlaces: vi.fn() }));

const verifiedUser: EcoRutaAuthUser = {
  uid: 'verified-user',
  email: 'persona@example.com',
  displayName: 'Persona',
  emailVerified: true,
};

function authService(): AuthService {
  return {
    subscribe(listener) {
      listener(verifiedUser);
      return () => undefined;
    },
    register: vi.fn(),
    signIn: vi.fn(),
    resendEmailVerification: vi.fn(),
    refreshUser: vi.fn(),
    getIdToken: vi.fn(async () => 'firebase-id-token'),
    sendPasswordReset: vi.fn(),
    signOut: vi.fn(),
  };
}

function MapTarget() {
  const location = useLocation();
  const state = location.state as { destination?: { label?: string } } | null;
  return <h1>Mapa: {state?.destination?.label ?? 'sin destino'}</h1>;
}

function renderEcoAi(service = authService()) {
  return render(
    <MemoryRouter initialEntries={['/eco-ai']}>
      <AuthProvider configuredOverride serviceLoader={async () => service}>
        <Routes>
          <Route path="/eco-ai" element={<EcoAiPage apiUrlOverride="https://eco-ai.example.workers.dev" />} />
          <Route path="/" element={<MapTarget />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function renderEcoAiWithoutBackend(service = authService()) {
  return render(
    <MemoryRouter initialEntries={['/eco-ai']}>
      <AuthProvider configuredOverride serviceLoader={async () => service}>
        <Routes>
          <Route path="/eco-ai" element={<EcoAiPage apiUrlOverride="" />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => vi.unstubAllGlobals());

describe('EcoAiPage secure flow', () => {
  it('stays disabled and explains the state when no secure backend is configured', async () => {
    renderEcoAiWithoutBackend();

    expect(await screen.findByText(/pendiente de despliegue seguro/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /mensaje para eco ia/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeDisabled();
  });

  it('sends one Spanish message, keeps history off, and asks before opening Geoapify', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
      answer: {
        reply: 'Puedo buscar Parque Kennedy con Geoapify. Confirma si deseas abrirlo en el mapa.',
        intent: 'destination_plan',
        destinationQuery: 'Parque Kennedy, Miraflores, Lima, Perú',
        requiresMapConfirmation: true,
      },
    })));
    vi.mocked(searchLimaPlaces).mockResolvedValue([{
      id: 'kennedy',
      label: 'Parque Kennedy',
      detail: 'Miraflores, Lima, Perú',
      coordinates: { latitude: -12.1219, longitude: -77.0306 },
    }]);
    renderEcoAi();

    const composer = await screen.findByRole('textbox', { name: /mensaje para eco ia/i });
    await user.type(composer, 'Quiero ir al Parque Kennedy caminando');
    await user.click(screen.getByRole('button', { name: /enviar mensaje/i }));

    expect(await screen.findByText(/puedo buscar parque kennedy/i)).toBeInTheDocument();
    expect(localStorage.getItem('ecoruta.eco-ai.messages')).toBeNull();
    expect(searchLimaPlaces).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /ver en el mapa/i }));
    await waitFor(() => expect(searchLimaPlaces).toHaveBeenCalledWith('Parque Kennedy, Miraflores, Lima, Perú', expect.any(AbortSignal)));
    expect(await screen.findByRole('heading', { name: /mapa: parque kennedy/i })).toBeInTheDocument();
  });

  it('shows the free limit returned by the Worker without a fabricated answer', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(
      { error: 'Eco IA alcanzó temporalmente el límite gratuito. Inténtalo más tarde.' },
      { status: 429 },
    )));
    renderEcoAi();

    await user.click(await screen.findByRole('button', { name: /beneficios tiene caminar/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/límite gratuito/i);
    expect(screen.queryByText(/respuesta generada/i)).not.toBeInTheDocument();
  });
});
