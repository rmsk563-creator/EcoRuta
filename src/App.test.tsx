import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { PreferencesProvider } from './state/PreferencesContext';
import { DataProvider } from './state/DataContext';
import { AuthProvider } from './state/AuthContext';

vi.mock('./config/geoapify', async () => {
  const actual = await vi.importActual<typeof import('./config/geoapify')>('./config/geoapify');

  return {
    ...actual,
    geoapifyApiKey: '',
    isGeoapifyConfigured: false,
  };
});

vi.mock('./config/ecoAi', () => ({
  ecoAiApiUrl: 'https://eco-ai.example.workers.dev',
}));

function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <PreferencesProvider>
        <AuthProvider configuredOverride={false}>
          <DataProvider>
            <App />
          </DataProvider>
        </AuthProvider>
      </PreferencesProvider>
    </MemoryRouter>,
  );
}

describe('EcoRuta app shell', () => {
  it('uses the map as the main destination and keeps settings inside profile', async () => {
    renderApp();

    expect(await screen.findByRole('heading', { name: /conecta geoapify/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Mapa' })).not.toHaveLength(0);
    expect(screen.getAllByRole('link', { name: 'Actividad' })).not.toHaveLength(0);
    expect(screen.getAllByRole('link', { name: 'Explorar' })).not.toHaveLength(0);
    expect(screen.getAllByRole('link', { name: 'Eco IA' })).not.toHaveLength(0);
    expect(screen.getByRole('link', { name: /abrir perfil/i })).toHaveAttribute('href', '/profile');
    expect(screen.queryByRole('link', { name: 'Ajustes' })).not.toBeInTheDocument();
  });

  it('opens profile from the header and exposes real settings routes', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('link', { name: /abrir perfil/i }));

    expect(await screen.findByRole('heading', { name: /tu espacio en ecoruta/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /apariencia/i })).toHaveAttribute('href', '/profile/settings#appearance');
    expect(screen.getByText(/ecoruta no envía notificaciones/i)).toBeInTheDocument();
  });

  it('explains how to configure Geoapify when the API key is absent', async () => {
    renderApp('/');

    expect(await screen.findByRole('heading', { name: /conecta geoapify/i })).toBeInTheDocument();
    expect(screen.getByText('VITE_GEOAPIFY_API_KEY')).toBeInTheDocument();
    expect(screen.queryByLabelText(/mapa interactivo/i)).not.toBeInTheDocument();
  });

  it('shows honest empty states for local collections', async () => {
    renderApp('/favorites');
    expect(await screen.findByRole('heading', { name: /aún no tienes favoritos/i })).toBeInTheDocument();
  });

  it('navigates to the official social links', async () => {
    renderApp('/about');

    expect(screen.getByRole('link', { name: /facebook/i })).toHaveAttribute(
      'href',
      'https://www.facebook.com/profile.php?id=61596786530370&locale=es_LA',
    );
    expect(screen.getByRole('link', { name: /tiktok/i })).toHaveAttribute('href', 'https://www.tiktok.com/@ecorutaservice');
    expect(screen.getByRole('link', { name: /youtube/i })).toHaveAttribute('href', 'https://www.youtube.com/@ECORUTA-i6k');
  });

  it('applies and persists the dark theme selection', async () => {
    const user = userEvent.setup();
    renderApp('/profile/settings');

    await user.click(screen.getByRole('radio', { name: /oscuro/i }));

    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    expect(screen.getByRole('radio', { name: /oscuro/i })).toHaveAttribute('aria-checked', 'true');
  });

  it('applies the selected color accent without changing the theme', async () => {
    const user = userEvent.setup();
    renderApp('/profile/settings');

    await user.click(screen.getByRole('radio', { name: /morado/i }));

    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-accent', 'purple'));
    expect(screen.getByRole('radio', { name: /morado/i })).toHaveAttribute('aria-checked', 'true');
  });

  it('restores default settings after confirmation', async () => {
    const user = userEvent.setup();
    renderApp('/profile/settings');

    await user.click(screen.getByRole('radio', { name: /oscuro/i }));
    await user.click(screen.getByRole('button', { name: /restablecer configuración/i }));
    await user.click(screen.getByRole('button', { name: /^restablecer$/i }));

    await waitFor(() => expect(screen.getByRole('radio', { name: /automático/i })).toHaveAttribute('aria-checked', 'true'));
  });

  it('keeps account access optional and does not simulate authentication', () => {
    renderApp('/account/sign-in');

    expect(screen.getByRole('heading', { name: /qué bueno verte/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeDisabled();
    expect(screen.getAllByText(/acceso con cuenta no disponible/i)).not.toHaveLength(0);
    expect(screen.getByRole('link', { name: /volver/i })).toHaveAttribute('href', '/account');
  });

  it('reuses the protected EcoRuta asset in the splash', () => {
    const { container } = render(
      <MemoryRouter>
        <PreferencesProvider><AuthProvider configuredOverride={false}><DataProvider><App /></DataProvider></AuthProvider></PreferencesProvider>
      </MemoryRouter>,
    );

    expect(container.querySelector('.splash .brand__mark img')).toHaveAttribute('src', expect.stringContaining('logo-ecoruta'));
  });

  it('requires a Firebase session before enabling the configured Eco IA backend', async () => {
    renderApp('/eco-ai');

    expect(await screen.findByRole('heading', { name: 'Eco IA' })).toBeInTheDocument();
    expect(screen.getByText(/inicia sesión para conversar/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /mensaje para eco ia/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeDisabled();
  });
});
