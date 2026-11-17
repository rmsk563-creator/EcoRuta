import { ArrowRight, BarChart3, Clock3, Heart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEcoRutaData } from '../state/DataContext';

export function ActivityPage() {
  const { favorites, trips } = useEcoRutaData();
  return (
    <div className="page activity-page">
      <header className="page-header page-header--compact">
        <p className="eyebrow">Actividad local</p>
        <h1>Tu movilidad, bajo tu control.</h1>
        <p>Consulta lo que guardaste en este dispositivo. EcoRuta no crea una cuenta ni sincroniza estos datos.</p>
      </header>
      <div className="activity-grid">
        <Link className="activity-card" to="/favorites">
          <span><Heart aria-hidden="true" /></span>
          <div><p>Favoritos</p><strong>{favorites.length} guardados</strong><small>Lugares y rutas frecuentes</small></div>
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link className="activity-card" to="/history">
          <span><Clock3 aria-hidden="true" /></span>
          <div><p>Historial</p><strong>{trips.length} recorridos</strong><small>Solo actividades confirmadas</small></div>
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link className="activity-card" to="/statistics">
          <span><BarChart3 aria-hidden="true" /></span>
          <div><p>Estadísticas</p><strong>Resumen personal</strong><small>Distancia, tiempo e impacto estimado</small></div>
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      <div className="privacy-note"><ShieldCheck aria-hidden="true" /><p>La actividad se almacena únicamente en este dispositivo. Las consultas y coordenadas usadas para calcular mapas y rutas sí se envían a Geoapify.</p></div>
    </div>
  );
}

