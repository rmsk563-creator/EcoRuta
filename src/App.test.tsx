import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { PreferencesProvider } from './state/PreferencesContext';

function renderApp(initialPath = '/') {
  sessionStorage.setItem('ecoruta.splash.seen', 'true');
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <PreferencesProvider>
        <App />
      </PreferencesProvider>
    </MemoryRouter>,
  );
}

describe('EcoRuta app shell', () => {
  it('shows only implemented destinations', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: /tu forma de moverte/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Inicio' })).not.toHaveLength(0);
    expect(screen.getAllByRole('link', { name: 'Mapa' })).not.toHaveLength(0);
    expect(screen.getAllByRole('link', { name: 'Acerca' })).not.toHaveLength(0);
    expect(screen.getAllByRole('link', { name: 'Ajustes' })).not.toHaveLength(0);
    expect(screen.queryByRole('link', { name: /favoritos|historial/i })).not.toBeInTheDocument();
  });

  it('explains how to configure Geoapify when the API key is absent', async () => {
    renderApp('/map');

    expect(await screen.findByRole('heading', { name: /conecta geoapify/i })).toBeInTheDocument();
    expect(screen.getByText('VITE_GEOAPIFY_API_KEY')).toBeInTheDocument();
    expect(screen.queryByLabelText(/mapa interactivo/i)).not.toBeInTheDocument();
  });

  it('navigates to the official social links', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getAllByRole('link', { name: 'Acerca' })[0]);

    expect(screen.getByRole('link', { name: /facebook/i })).toHaveAttribute(
      'href',
      'https://www.facebook.com/profile.php?id=61596786530370&locale=es_LA',
    );
    expect(screen.getByRole('link', { name: /tiktok/i })).toHaveAttribute('href', 'https://www.tiktok.com/@ecorutaservice');
    expect(screen.getByRole('link', { name: /youtube/i })).toHaveAttribute('href', 'https://www.youtube.com/@ECORUTA-i6k');
  });

  it('applies and persists the dark theme selection', async () => {
    const user = userEvent.setup();
    renderApp('/settings');

    await user.click(screen.getByRole('radio', { name: /oscuro/i }));

    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    expect(screen.getByRole('radio', { name: /oscuro/i })).toHaveAttribute('aria-checked', 'true');
  });

  it('restores default settings after confirmation', async () => {
    const user = userEvent.setup();
    renderApp('/settings');

    await user.click(screen.getByRole('radio', { name: /oscuro/i }));
    await user.click(screen.getByRole('button', { name: /restablecer configuración/i }));
    await user.click(screen.getByRole('button', { name: /^restablecer$/i }));

    await waitFor(() => expect(screen.getByRole('radio', { name: /automático/i })).toHaveAttribute('aria-checked', 'true'));
  });
});
