import { House, Info, Map, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavigationItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const items: NavigationItem[] = [
  { to: '/', label: 'Inicio', icon: House, end: true },
  { to: '/map', label: 'Mapa', icon: Map },
  { to: '/about', label: 'Acerca', icon: Info },
  { to: '/settings', label: 'Ajustes', icon: SlidersHorizontal },
];

export function AppNavigation({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav className={mobile ? 'bottom-nav' : 'side-nav'} aria-label="Navegación principal">
      <div className={mobile ? 'bottom-nav__inner' : 'side-nav__inner'}>
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}
          >
            <Icon aria-hidden="true" strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
