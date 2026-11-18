import {
  ArrowRight,
  BellOff,
  CircleHelp,
  LogIn,
  LogOut,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuthErrorMessage } from '../services/auth/errors';
import { useAuth } from '../state/AuthContext';

export function ProfilePage() {
  const auth = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState('');
  const displayName = auth.user?.displayName?.trim();

  const closeSession = async () => {
    if (!auth.user || signingOut) return;
    setSigningOut(true);
    setMessage('');
    try {
      await auth.signOut();
      setMessage('Sesión cerrada. La actividad local permanece en este dispositivo.');
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="page profile-page">
      <header className="profile-identity">
        <span className="profile-identity__avatar" aria-hidden="true">
          {displayName?.charAt(0).toLocaleUpperCase('es') || <UserRound />}
        </span>
        <div>
          <p className="kicker">Perfil</p>
          <h1>{auth.user ? displayName || 'Cuenta EcoRuta' : 'Tu espacio en EcoRuta'}</h1>
          <p>{auth.user?.email || 'Usas la aplicación sin una cuenta. Tus datos se guardan localmente.'}</p>
        </div>
      </header>

      {message && <p className="inline-notice profile-message" role="status">{message}</p>}

      <section className="profile-section" aria-labelledby="preferences-title">
        <h2 id="preferences-title">Preferencias</h2>
        <div className="profile-menu">
          <Link className="profile-menu__item" to="/profile/settings#appearance">
            <span className="profile-menu__icon"><Palette aria-hidden="true" /></span>
            <span><strong>Apariencia</strong><small>Tema, color y movimiento</small></span>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link className="profile-menu__item" to="/profile/settings#mobility">
            <span className="profile-menu__icon"><SlidersHorizontal aria-hidden="true" /></span>
            <span><strong>Preferencias de ruta</strong><small>Modalidad y unidades</small></span>
            <ArrowRight aria-hidden="true" />
          </Link>
          <div className="profile-menu__item profile-menu__item--static">
            <span className="profile-menu__icon"><BellOff aria-hidden="true" /></span>
            <span><strong>Notificaciones</strong><small>EcoRuta no envía notificaciones</small></span>
          </div>
        </div>
      </section>

      <section className="profile-section" aria-labelledby="support-title">
        <h2 id="support-title">Privacidad y soporte</h2>
        <div className="profile-menu">
          <Link className="profile-menu__item" to="/profile/settings#privacy">
            <span className="profile-menu__icon"><ShieldCheck aria-hidden="true" /></span>
            <span><strong>Privacidad y datos</strong><small>Copias, permisos y almacenamiento local</small></span>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link className="profile-menu__item" to="/about">
            <span className="profile-menu__icon"><CircleHelp aria-hidden="true" /></span>
            <span><strong>Ayuda e información</strong><small>Cómo funciona EcoRuta y canales oficiales</small></span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="profile-account" aria-labelledby="account-title">
        <div>
          <h2 id="account-title">Cuenta</h2>
          <p>{auth.user ? 'Firebase conserva la sesión. Favoritos, historial y estadísticas continúan en este dispositivo.' : 'El acceso con cuenta es opcional en esta instalación.'}</p>
        </div>
        {auth.user ? (
          <button className="button button--quiet" type="button" onClick={() => void closeSession()} disabled={signingOut}>
            <LogOut aria-hidden="true" /> {signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        ) : auth.configured ? (
          <Link className="button button--primary" to="/account"><LogIn aria-hidden="true" /> Acceder</Link>
        ) : null}
      </section>
    </div>
  );
}
