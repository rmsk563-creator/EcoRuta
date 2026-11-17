import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MapErrorBoundary } from './MapErrorBoundary';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MapErrorBoundary', () => {
  it('keeps the application usable and can retry after a map failure', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let shouldFail = true;

    function UnstableMap() {
      if (shouldFail) throw new Error('MapLibre failed');
      return <div>Mapa recuperado</div>;
    }

    render(<MapErrorBoundary><UnstableMap /></MapErrorBoundary>);

    expect(screen.getByRole('heading', { name: /mapa no pudo mostrarse/i })).toBeInTheDocument();
    shouldFail = false;
    await user.click(screen.getByRole('button', { name: /reintentar mapa/i }));

    expect(screen.getByText('Mapa recuperado')).toBeInTheDocument();
  });
});
