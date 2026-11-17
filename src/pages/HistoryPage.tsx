import { Bike, CalendarDays, ChevronDown, Clock3, Footprints, Route, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import type { CompletedTrip } from '../data/types';
import type { MapNavigationState } from '../navigation/mapState';
import { useEcoRutaData } from '../state/DataContext';
import { formatDateTime, formatDistance, formatDuration } from '../utils/format';

type ModeFilter = 'all' | 'walk' | 'bicycle';
type DateFilter = 'all' | '7' | '30' | '365';

export function HistoryPage() {
  const navigate = useNavigate();
  const { trips, ready, error, clearError, deleteTrip } = useEcoRutaData();
  const [mode, setMode] = useState<ModeFilter>('all');
  const [days, setDays] = useState<DateFilter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const visibleTrips = useMemo(() => {
    const cutoff = days === 'all' ? null : Date.now() - Number(days) * 24 * 60 * 60 * 1000;
    return trips.filter((trip) => (
      (mode === 'all' || trip.mode === mode) &&
      (cutoff === null || Date.parse(trip.completedAt) >= cutoff)
    ));
  }, [days, mode, trips]);

  const recalculate = (trip: CompletedTrip) => {
    const state: MapNavigationState = {
      origin: trip.origin,
      destination: trip.destination,
      preferredMode: trip.mode,
      source: 'history',
    };
    navigate('/map', { state });
  };

  const confirmDelete = async (id: string) => {
    await deleteTrip(id);
    setDeleting(null);
    setMessage('Recorrido eliminado. Las estadísticas fueron actualizadas.');
  };

  return (
    <div className="page collection-page">
      <header className="page-header page-header--compact collection-header">
        <div><p className="eyebrow"><Clock3 aria-hidden="true" /> Historial</p><h1>Recorridos que confirmaste.</h1><p>Una ruta consultada no aparece aquí hasta que indiques explícitamente que la realizaste.</p></div>
        <span className="count-badge">{trips.length} realizados</span>
      </header>

      {(error || message) && <div className="inline-notice" role="status"><p>{error || message}</p><button type="button" onClick={() => { clearError(); setMessage(''); }}>Cerrar</button></div>}

      {!ready ? <div className="data-loading" role="status">Cargando historial local…</div> : trips.length === 0 ? (
        <EmptyState icon={Clock3} title="Todavía no hay recorridos realizados" description="Calcula una ruta y regístrala solo después de haberla realizado." actionLabel="Planificar una ruta" actionTo="/map" />
      ) : (
        <>
          <div className="collection-toolbar collection-toolbar--filters">
            <label className="select-control"><span>Modalidad</span><select value={mode} onChange={(event) => setMode(event.target.value as ModeFilter)}><option value="all">Todas</option><option value="walk">Caminar</option><option value="bicycle">Bicicleta</option></select></label>
            <label className="select-control"><span>Fecha</span><select value={days} onChange={(event) => setDays(event.target.value as DateFilter)}><option value="all">Todo el historial</option><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option><option value="365">Último año</option></select></label>
          </div>
          {visibleTrips.length === 0 ? <EmptyState icon={CalendarDays} title="No hay recorridos con estos filtros" description="Cambia el periodo o la modalidad para ampliar la búsqueda." /> : (
            <div className="collection-list history-list">
              {visibleTrips.map((trip) => {
                const ModeIcon = trip.mode === 'walk' ? Footprints : Bike;
                const isExpanded = expanded === trip.id;
                return (
                  <article className="collection-card history-card" key={trip.id}>
                    <span className="collection-card__icon"><ModeIcon aria-hidden="true" /></span>
                    <div className="collection-card__body">
                      <span className="type-label">Recorrido realizado</span>
                      <h2>{trip.origin.label} <span aria-hidden="true">→</span> {trip.destination.label}</h2>
                      <p>{formatDateTime(trip.completedAt)}</p>
                      <div className="trip-metrics"><span>{formatDistance(trip.distanceMeters)}</span><span>{formatDuration(trip.durationSeconds)}</span><span>{trip.mode === 'walk' ? 'Caminando' : 'Bicicleta'}</span></div>
                    </div>
                    <div className="collection-card__actions">
                      <button type="button" className="button button--primary button--small" onClick={() => recalculate(trip)}><Route aria-hidden="true" /> Calcular de nuevo</button>
                      <button type="button" className="icon-button" aria-label={`${isExpanded ? 'Ocultar' : 'Ver'} detalles`} aria-expanded={isExpanded} onClick={() => setExpanded(isExpanded ? null : trip.id)}><ChevronDown className={isExpanded ? 'rotate-180' : ''} aria-hidden="true" /></button>
                      <button type="button" className="icon-button icon-button--danger" aria-label="Eliminar recorrido" onClick={() => setDeleting(trip.id)}><Trash2 aria-hidden="true" /></button>
                    </div>
                    {isExpanded && (
                      <dl className="trip-details"><div><dt>Origen</dt><dd>{trip.origin.label}<small>{trip.origin.detail}</small></dd></div><div><dt>Destino</dt><dd>{trip.destination.label}<small>{trip.destination.detail}</small></dd></div><div><dt>Fuente del cálculo</dt><dd>Geoapify</dd></div><div><dt>Alternativa declarada</dt><dd>{trip.wouldReplaceCar ? 'Habría utilizado automóvil' : 'No se indicó automóvil'}</dd></div></dl>
                    )}
                    {deleting === trip.id && (
                      <div className="card-confirm" role="group" aria-label="Confirmar eliminación del recorrido"><p>¿Eliminar este recorrido realizado?</p><div><button className="button button--quiet button--small" type="button" onClick={() => setDeleting(null)}>Cancelar</button><button className="button button--danger button--small" type="button" onClick={() => void confirmDelete(trip.id)}>Eliminar</button></div></div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

