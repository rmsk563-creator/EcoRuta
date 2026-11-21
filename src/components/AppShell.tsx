import { UserRound } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AppNavigation } from './AppNavigation';
import { Brand } from './Brand';
import { SplashScreen } from './SplashScreen';
import { useAuth } from '../state/AuthContext';

export function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const mapIsActive = location.pathname === '/';
  const ecoAiIsActive = location.pathname === '/eco-ai';

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
          <p>Privacidad local</p>
          <span>Tu actividad permanece en el dispositivo</span>
        </div>
      </aside>

      <div className={`app-frame${mapIsActive ? ' app-frame--map' : ''}${ecoAiIsActive ? ' app-frame--eco-ai' : ''}`}>
        <header className={`topbar${mapIsActive ? ' topbar--map' : ''}`}>
          <Brand />
          <NavLink className="profile-trigger" to="/profile" aria-label="Abrir perfil">
            <span aria-hidden="true">{user?.displayName?.trim().charAt(0).toLocaleUpperCase('es') || <UserRound />}</span>
          </NavLink>
        </header>

        <main id="main-content" className={`main-content${mapIsActive ? ' main-content--map' : ''}${ecoAiIsActive ? ' main-content--eco-ai' : ''}`} tabIndex={-1}>
          <Outlet />
        </main>

        <AppNavigation mobile />
      </div>
    </div>
  );
}
