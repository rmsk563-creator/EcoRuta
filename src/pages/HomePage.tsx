import { ArrowRight, Bike, Eye, Footprints, Leaf, LockKeyhole, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEcoRutaData } from '../state/DataContext';
import { usePreferences } from '../state/PreferencesContext';

export function HomePage() {
  const { preferences } = usePreferences();
  const { favorites, trips } = useEcoRutaData();

  return (
    <div className="page home-page">
      <section className="hero-panel" aria-labelledby="home-title">
        <div className="hero-panel__copy">
          <p className="eyebrow"><Leaf aria-hidden="true" /> Movilidad sostenible en Lima</p>
          <h1 id="home-title">{preferences.alias ? `${preferences.alias}, muévete` : 'Tu forma de moverte'}, con más intención.</h1>
          <p className="hero-panel__lead">
            Busca lugares en Lima y compara recorridos reales para caminar o usar bicicleta, sin crear una cuenta.
          </p>
          <div className="hero-panel__actions">
            <Link className="button button--primary" to="/">
              Planificar una ruta <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="button button--quiet" to="/about">Conocer el proyecto</Link>
          </div>
        </div>

        <div className="mobility-visual" aria-hidden="true">
          <div className="mobility-visual__halo" />
          <div className="mobility-visual__route">
            <span className="route-point route-point--start" />
            <svg viewBox="0 0 260 180" role="presentation">
              <path d="M31 143C63 113 63 63 110 70c55 8 40-39 89-32 28 4 27 29 31 49" />
            </svg>
            <span className="route-point route-point--end"><Leaf /></span>
          </div>
          <span className="mode-orbit mode-orbit--walk"><Footprints />Caminar</span>
          <span className="mode-orbit mode-orbit--bike"><Bike />Bicicleta</span>
        </div>
      </section>

      <section className="section-block" aria-labelledby="your-ecoruta-title">
        <div className="section-heading">
          <div>
            <p className="kicker">Tu EcoRuta</p>
            <h2 id="your-ecoruta-title">Preferencias que ya están activas</h2>
          </div>
          <Link className="text-link" to="/profile/settings">Editar <ArrowRight aria-hidden="true" /></Link>
        </div>

        <div className="preference-grid">
          <article className="summary-card summary-card--accent">
            <span className="summary-card__icon"><SlidersHorizontal aria-hidden="true" /></span>
            <div>
              <p>Apariencia</p>
              <strong>{preferences.theme === 'system' ? 'Según el dispositivo' : preferences.theme === 'dark' ? 'Oscura' : 'Clara'}</strong>
            </div>
          </article>
          <article className="summary-card">
            <span className="summary-card__icon"><Sparkles aria-hidden="true" /></span>
            <div>
              <p>Actividad registrada</p>
              <strong>{trips.length} {trips.length === 1 ? 'recorrido' : 'recorridos'}</strong>
            </div>
          </article>
          <article className="summary-card">
            <span className="summary-card__icon"><LockKeyhole aria-hidden="true" /></span>
            <div>
              <p>Favoritos locales</p>
              <strong>{favorites.length} guardados</strong>
            </div>
          </article>
        </div>
      </section>

      <section className="section-block" aria-labelledby="principles-title">
        <div className="section-heading">
          <div>
            <p className="kicker">Principios del producto</p>
            <h2 id="principles-title">Claridad antes que promesas</h2>
          </div>
        </div>
        <div className="principles-grid">
          <article className="principle-card">
            <Leaf aria-hidden="true" />
            <h3>Impacto transparente</h3>
            <p>Las estimaciones ambientales mostrarán su fuente y sus supuestos.</p>
          </article>
          <article className="principle-card">
            <Eye aria-hidden="true" />
            <h3>Experiencia accesible</h3>
            <p>Contraste, foco, movimiento reducido y controles táctiles forman parte de la base.</p>
          </article>
          <article className="principle-card">
            <LockKeyhole aria-hidden="true" />
            <h3>Privacidad local</h3>
            <p>EcoRuta no pide una cuenta para personalizar la experiencia.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
