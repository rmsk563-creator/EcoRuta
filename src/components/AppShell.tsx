import { Moon, Sun } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { AppNavigation } from './AppNavigation';
import { Brand } from './Brand';
import { SplashScreen } from './SplashScreen';
import { usePreferences } from '../state/PreferencesContext';

export function AppShell() {
  const { preferences, updatePreferences } = usePreferences();
  const isDark = preferences.theme === 'dark' || (
    preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const toggleTheme = () => {
    void updatePreferences({ theme: isDark ? 'light' : 'dark' });
  };

  return (
    <div className="app-shell">
      <SplashScreen />
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>

      <aside className="sidebar">
        <div className="sidebar__brand">
          <Brand />
        </div>
        <AppNavigation />
        <div className="sidebar__footer">
          <p>Preferencias locales</p>
          <span>Sin cuenta · sin seguimiento</span>
        </div>
      </aside>

      <div className="app-frame">
        <header className="topbar">
          <Brand />
          <button className="icon-button" type="button" onClick={toggleTheme} aria-label={isDark ? 'Usar tema claro' : 'Usar tema oscuro'}>
            {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
        </header>

        <main id="main-content" className="main-content" tabIndex={-1}>
          <Outlet />
        </main>

        <AppNavigation mobile />
      </div>
    </div>
  );
}
