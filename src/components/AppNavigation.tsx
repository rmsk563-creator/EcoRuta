import { BarChart3, Clock3, Heart, House, Info, LayoutGrid, Map, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavigationItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const desktopItems: NavigationItem[] = [
  { to: '/', label: 'Inicio', icon: House, end: true },
  { to: '/map', label: 'Mapa', icon: Map },
  { to: '/favorites', label: 'Favoritos', icon: Heart },
  { to: '/history', label: 'Historial', icon: Clock3 },
  { to: '/statistics', label: 'Estadísticas', icon: BarChart3 },
  { to: '/about', label: 'Acerca', icon: Info },
  { to: '/settings', label: 'Ajustes', icon: SlidersHorizontal },
];

const mobileItems: NavigationItem[] = [
  { to: '/', label: 'Inicio', icon: House, end: true },
  { to: '/map', label: 'Mapa', icon: Map },
  { to: '/activity', label: 'Actividad', icon: LayoutGrid },
  { to: '/settings', label: 'Ajustes', icon: SlidersHorizontal },
];

export function AppNavigation({ mobile = false }: { mobile?: boolean }) {
  const items = mobile ? mobileItems : desktopItems;
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
