import { Compass, LayoutGrid, Map, MessageCircleMore, type LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavigationItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const desktopItems: NavigationItem[] = [
  { to: '/', label: 'Mapa', icon: Map, end: true },
  { to: '/activity', label: 'Actividad', icon: LayoutGrid },
  { to: '/explore', label: 'Explorar', icon: Compass },
  { to: '/eco-ai', label: 'Eco IA', icon: MessageCircleMore },
];

const mobileItems: NavigationItem[] = [
  { to: '/', label: 'Mapa', icon: Map, end: true },
  { to: '/activity', label: 'Actividad', icon: LayoutGrid },
  { to: '/explore', label: 'Explorar', icon: Compass },
  { to: '/eco-ai', label: 'Eco IA', icon: MessageCircleMore },
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
