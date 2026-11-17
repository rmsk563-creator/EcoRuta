import { BarChart3, Bike, CarFront, Clock3, ExternalLink, Footprints, Leaf, Route } from 'lucide-react';
import { useMemo, useState, type CSSProperties } from 'react';
import { ExternalLinkAnchor } from '../components/ExternalLinkAnchor';
import { CAR_CO2_KG_PER_KM, CAR_CO2_SOURCE_URL, calculatePeriodStatistics, type StatisticsPeriod } from '../data/statistics';
import { useEcoRutaData } from '../state/DataContext';
import { formatDistance, formatDuration } from '../utils/format';

const periodLabels: Record<StatisticsPeriod, string> = { week: 'Semana', month: 'Mes', year: 'Año' };

function formatChange(value: number | null) {
  if (value === null) return 'Sin periodo anterior comparable';
  if (value === 0) return 'Sin cambios frente al periodo anterior';
  return `${value > 0 ? '+' : ''}${value.toLocaleString('es-PE', { maximumFractionDigits: 0 })} % frente al periodo anterior`;
}

export function StatisticsPage() {
  const { trips, ready } = useEcoRutaData();
  const [period, setPeriod] = useState<StatisticsPeriod>('month');
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const statistics = useMemo(() => calculatePeriodStatistics(trips, period), [period, trips]);
  const maxDistance = Math.max(1, ...statistics.chart.map((point) => point.distanceMeters));
  const selected = statistics.chart.find((point) => point.key === selectedPoint) ?? null;
  const walkShare = statistics.current.distanceMeters === 0 ? 0 : statistics.current.walkMeters / statistics.current.distanceMeters * 100;
  const bikeShare = statistics.current.distanceMeters === 0 ? 0 : statistics.current.bicycleMeters / statistics.current.distanceMeters * 100;

  return (
    <div className="page statistics-page">
      <header className="page-header page-header--compact collection-header">
        <div><p className="eyebrow"><BarChart3 aria-hidden="true" /> Estadísticas</p><h1>Tu movilidad en perspectiva.</h1><p>Todos los indicadores se calculan únicamente con recorridos que registraste como realizados.</p></div>
        <div className="period-control" role="radiogroup" aria-label="Periodo de estadísticas">
          {(Object.keys(periodLabels) as StatisticsPeriod[]).map((value) => <button key={value} type="button" role="radio" aria-checked={period === value} className={period === value ? 'is-active' : ''} onClick={() => { setPeriod(value); setSelectedPoint(null); }}>{periodLabels[value]}</button>)}
        </div>
      </header>

      {!ready ? <div className="data-loading" role="status">Calculando estadísticas locales…</div> : (
        <>
          <section className="metric-grid" aria-label="Indicadores principales">
            <article className="metric-card"><span><Route aria-hidden="true" /></span><p>Recorridos realizados</p><strong>{statistics.current.trips}</strong><small>{formatChange(statistics.distanceChangePercent)}</small></article>
            <article className="metric-card"><span><BarChart3 aria-hidden="true" /></span><p>Distancia sostenible</p><strong>{formatDistance(statistics.current.distanceMeters, 'kilometers')}</strong><small>En el periodo elegido</small></article>
            <article className="metric-card"><span><Clock3 aria-hidden="true" /></span><p>Tiempo acumulado</p><strong>{statistics.current.durationSeconds ? formatDuration(statistics.current.durationSeconds) : '0 min'}</strong><small>Duración registrada</small></article>
            <article className="metric-card metric-card--impact"><span><Leaf aria-hidden="true" /></span><p>CO₂ potencialmente evitado</p><strong>{statistics.current.avoidedCo2Kg.toLocaleString('es-PE', { maximumFractionDigits: 2 })} kg</strong><small>Solo viajes declarados como sustitución de auto</small></article>
          </section>

          <div className="analytics-grid">
            <section className="analytics-card" aria-labelledby="activity-chart-title">
              <div className="analytics-card__heading"><div><p className="kicker">Actividad</p><h2 id="activity-chart-title">Distancia por periodo</h2></div><span>{periodLabels[period]}</span></div>
              <div className="bar-chart" aria-label="Gráfico interactivo de distancia" style={{ '--chart-columns': statistics.chart.length } as CSSProperties}>
                {statistics.chart.map((point) => {
                  const height = point.distanceMeters === 0 ? 4 : Math.max(12, point.distanceMeters / maxDistance * 100);
                  return <button key={point.key} type="button" className={selected?.key === point.key ? 'is-selected' : ''} onClick={() => setSelectedPoint(point.key)} aria-label={`${point.label}: ${formatDistance(point.distanceMeters, 'kilometers')}, ${point.trips} recorridos`}><span className="bar-chart__bar" style={{ height: `${height}%` }} /><small>{point.label}</small></button>;
                })}
              </div>
              <p className="chart-detail" aria-live="polite">{selected ? `${selected.label}: ${formatDistance(selected.distanceMeters, 'kilometers')} en ${selected.trips} ${selected.trips === 1 ? 'recorrido' : 'recorridos'}.` : 'Selecciona una barra para consultar el detalle.'}</p>
            </section>

            <section className="analytics-card" aria-labelledby="modes-title">
              <div className="analytics-card__heading"><div><p className="kicker">Modalidades</p><h2 id="modes-title">Distribución de distancia</h2></div></div>
              <div className="mode-distribution" aria-label="Distribución por modalidad">
                <div className="mode-distribution__bar"><span style={{ width: `${walkShare}%` }} /><span style={{ width: `${bikeShare}%` }} /></div>
                <div className="mode-stat"><span><Footprints aria-hidden="true" /></span><div><p>Caminar</p><strong>{formatDistance(statistics.current.walkMeters, 'kilometers')}</strong></div><b>{Math.round(walkShare)} %</b></div>
                <div className="mode-stat"><span><Bike aria-hidden="true" /></span><div><p>Bicicleta</p><strong>{formatDistance(statistics.current.bicycleMeters, 'kilometers')}</strong></div><b>{Math.round(bikeShare)} %</b></div>
              </div>
            </section>
          </div>

          <section className="impact-card" aria-labelledby="impact-title">
            <div className="impact-card__icon"><CarFront aria-hidden="true" /></div>
            <div><p className="kicker">Impacto estimado</p><h2 id="impact-title">Comparación con automóvil</h2><p>EcoRuta multiplica únicamente la distancia que marcaste como sustitución de automóvil por <strong>{CAR_CO2_KG_PER_KM.toLocaleString('es-PE')} kg de CO₂ por kilómetro</strong>. El factor corresponde a un vehículo M1 moderno a gasolina en la metodología oficial del Ministerio de Transportes y Comunicaciones del Perú.</p><dl><div><dt>Distancia declarada</dt><dd>{formatDistance(statistics.current.carReplacementMeters, 'kilometers')}</dd></div><div><dt>CO₂ potencialmente evitado</dt><dd>{statistics.current.avoidedCo2Kg.toLocaleString('es-PE', { maximumFractionDigits: 2 })} kg</dd></div></dl><p className="impact-disclaimer">Es una estimación de emisiones directas potenciales, no una medición ni una garantía ambiental. No incluye fabricación, congestión, clima ni ciclo de vida.</p><ExternalLinkAnchor className="text-link" href={CAR_CO2_SOURCE_URL}>Consultar metodología oficial <ExternalLink aria-hidden="true" /></ExternalLinkAnchor></div>
          </section>
        </>
      )}
    </div>
  );
}

