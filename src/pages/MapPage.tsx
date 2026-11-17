import {
  AlertCircle,
  Bike,
  CheckCircle2,
  Footprints,
  KeyRound,
  LoaderCircle,
  LocateFixed,
  MapPinned,
  Navigation,
  RefreshCw,
  Route,
  Square,
} from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { PlaceSearchField } from '../components/map/PlaceSearchField';
import { isGeoapifyConfigured } from '../config/geoapify';
import { useDeviceLocation } from '../hooks/useDeviceLocation';
import { calculateRoute, reverseGeocodeLima } from '../services/geoapify/client';
import { getGeoapifyErrorMessage } from '../services/geoapify/errors';
import type { Coordinates, EndpointRole, PlaceSelection, RouteMode, RouteResult } from '../services/geoapify/types';
import { usePreferences } from '../state/PreferencesContext';

const MapCanvas = lazy(() => import('../components/map/MapCanvas').then((module) => ({ default: module.MapCanvas })));

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toLocaleString('es-PE', { maximumFractionDigits: 1 })} km`;
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
}

function coordinatePlace(coordinates: Coordinates): PlaceSelection {
  const detail = `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`;
  return { id: `coordinate:${detail}`, label: 'Punto seleccionado', detail, coordinates };
}

export function MapPage() {
  const { preferences } = usePreferences();
  const location = useDeviceLocation();
  const [origin, setOrigin] = useState<PlaceSelection | null>(null);
  const [destination, setDestination] = useState<PlaceSelection | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState<EndpointRole>('destination');
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [selectedMode, setSelectedMode] = useState<RouteMode>('walk');
  const [routeLoading, setRouteLoading] = useState(false);
  const [pointLoading, setPointLoading] = useState(false);
  const [message, setMessage] = useState('');
  const request = useRef<AbortController | null>(null);

  const isDark = preferences.theme === 'dark' || (
    preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const changeEndpoint = useCallback((role: EndpointRole, place: PlaceSelection | null) => {
    if (role === 'origin') setOrigin(place);
    else setDestination(place);
    setRoutes([]);
    setMessage('');
  }, []);

  useEffect(() => {
    if (!location.position || location.status !== 'tracking') return;
    const coordinates = location.position;
    setOrigin((current) => {
      if (current && current.id !== 'gps-current') return current;
      return {
        id: 'gps-current',
        label: 'Mi ubicación actual',
        detail: location.accuracy ? `Precisión aproximada: ${Math.round(location.accuracy)} m` : 'Ubicación obtenida por GPS',
        coordinates,
      };
    });
    setRoutes([]);
  }, [location.accuracy, location.position, location.status]);

  useEffect(() => () => request.current?.abort(), []);

  const selectFromMap = useCallback(async (coordinates: Coordinates) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    changeEndpoint(activeEndpoint, coordinatePlace(coordinates));
    setPointLoading(true);
    try {
      const place = await reverseGeocodeLima(coordinates, controller.signal);
      changeEndpoint(activeEndpoint, place);
      setActiveEndpoint(activeEndpoint === 'origin' ? 'destination' : 'origin');
    } catch (error) {
      const nextMessage = getGeoapifyErrorMessage(error);
      if (nextMessage) setMessage(`${nextMessage} Conservamos las coordenadas seleccionadas.`);
    } finally {
      setPointLoading(false);
    }
  }, [activeEndpoint, changeEndpoint]);

  const compareRoutes = async () => {
    if (!origin || !destination) {
      setMessage('Selecciona un origen y un destino antes de calcular las rutas.');
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setRouteLoading(true);
    setRoutes([]);
    setMessage('');
    const results = await Promise.allSettled([
      calculateRoute(origin.coordinates, destination.coordinates, 'walk', controller.signal),
      calculateRoute(origin.coordinates, destination.coordinates, 'bicycle', controller.signal),
    ]);
    const available = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
    const failures = results.flatMap((result) => result.status === 'rejected' ? [getGeoapifyErrorMessage(result.reason)] : []);
    setRoutes(available);
    if (available.length === 0) setMessage(failures[0] || 'No se encontraron rutas sostenibles entre los puntos elegidos.');
    else if (failures.length > 0) setMessage(`Se calculó ${available.length === 1 ? 'una modalidad' : 'parte de la comparación'}. ${failures[0]}`);
    setRouteLoading(false);
  };

  if (!isGeoapifyConfigured) {
    return (
      <div className="page map-page map-page--setup">
        <header className="page-header page-header--compact">
          <p className="eyebrow"><MapPinned aria-hidden="true" /> Mapa y rutas</p>
          <h1>Conecta Geoapify para activar rutas reales.</h1>
          <p>EcoRuta no carga mapas ni presenta resultados hasta encontrar una API key válida en tu entorno local.</p>
        </header>
        <section className="provider-setup" aria-labelledby="provider-setup-title">
          <div className="provider-setup__icon"><KeyRound aria-hidden="true" /></div>
          <div>
            <p className="kicker">Configuración pendiente</p>
            <h2 id="provider-setup-title">Añade tu clave sin publicarla</h2>
            <ol>
              <li>Crea una cuenta gratuita en <a href="https://myprojects.geoapify.com/" target="_blank" rel="noreferrer">Geoapify MyProjects</a>.</li>
              <li>Crea un proyecto y copia la API key generada en la sección “API Keys”.</li>
              <li>Copia <code>.env.example</code> como <code>.env.local</code> y completa <code>VITE_GEOAPIFY_API_KEY</code>.</li>
              <li>Reinicia <code>npm run dev</code>. Vite lee variables de entorno solo al iniciar.</li>
            </ol>
            <div className="provider-setup__security">
              <CheckCircle2 aria-hidden="true" />
              <p>Restringe la clave por HTTP referrer/origin y CORS. Usa <code>http://localhost:5173</code> durante desarrollo y añade solo los dominios reales que controles.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page map-page">
      <header className="map-page__header">
        <div>
          <p className="eyebrow"><MapPinned aria-hidden="true" /> Lima, Perú</p>
          <h1>Encuentra tu EcoRuta.</h1>
          <p>Busca lugares o toca el mapa. Las distancias y tiempos provienen directamente de Geoapify.</p>
        </div>
        <button
          type="button"
          className={`button ${location.status === 'tracking' ? 'button--quiet' : 'button--primary'}`}
          onClick={() => location.status === 'tracking' ? void location.stop() : void location.start()}
          disabled={location.status === 'requesting'}
        >
          {location.status === 'requesting' ? <LoaderCircle className="spin" aria-hidden="true" /> : location.status === 'tracking' ? <Square aria-hidden="true" /> : <LocateFixed aria-hidden="true" />}
          {location.status === 'requesting' ? 'Solicitando permiso' : location.status === 'tracking' ? 'Detener GPS' : 'Usar mi ubicación'}
        </button>
      </header>

      {(location.error || message) && (
        <div className="map-alert" role="alert">
          <AlertCircle aria-hidden="true" />
          <p>{location.error || message}</p>
          {message && <button type="button" onClick={() => setMessage('')} aria-label="Cerrar aviso">Cerrar</button>}
        </div>
      )}

      <div className="route-planner">
        <aside className="route-panel" aria-label="Planificador de ruta">
          <div className="endpoint-selector" role="radiogroup" aria-label="Punto que se seleccionará en el mapa">
            <button type="button" role="radio" aria-checked={activeEndpoint === 'origin'} className={activeEndpoint === 'origin' ? 'is-active' : ''} onClick={() => setActiveEndpoint('origin')}>Origen</button>
            <button type="button" role="radio" aria-checked={activeEndpoint === 'destination'} className={activeEndpoint === 'destination' ? 'is-active' : ''} onClick={() => setActiveEndpoint('destination')}>Destino</button>
          </div>

          <PlaceSearchField label="Origen" placeholder="Calle, dirección o lugar" selection={origin} onChange={(place) => changeEndpoint('origin', place)} onError={setMessage} />
          <button
            className="swap-button"
            type="button"
            disabled={!origin && !destination}
            onClick={() => {
              setOrigin(destination);
              setDestination(origin);
              setRoutes([]);
            }}
          >
            <RefreshCw aria-hidden="true" /> Intercambiar origen y destino
          </button>
          <PlaceSearchField label="Destino" placeholder="¿A dónde quieres ir?" selection={destination} onChange={(place) => changeEndpoint('destination', place)} onError={setMessage} />

          <button type="button" className="button button--primary calculate-button" disabled={!origin || !destination || routeLoading || pointLoading} onClick={() => void compareRoutes()}>
            {routeLoading ? <LoaderCircle className="spin" aria-hidden="true" /> : <Route aria-hidden="true" />}
            {routeLoading ? 'Consultando rutas reales' : 'Comparar rutas'}
          </button>

          {routes.length > 0 && (
            <section className="route-results" aria-labelledby="route-results-title">
              <div className="route-results__heading">
                <div><p className="kicker">Comparación</p><h2 id="route-results-title">Modalidades disponibles</h2></div>
                <span>Geoapify</span>
              </div>
              <div className="route-cards">
                {routes.map((route) => {
                  const active = selectedMode === route.mode;
                  const Icon = route.mode === 'walk' ? Footprints : Bike;
                  return (
                    <button key={route.mode} type="button" className={`route-card route-card--${route.mode}${active ? ' is-selected' : ''}`} onClick={() => setSelectedMode(route.mode)} aria-pressed={active}>
                      <span className="route-card__icon"><Icon aria-hidden="true" /></span>
                      <span><strong>{route.mode === 'walk' ? 'Caminar' : 'Bicicleta'}</strong><small>{formatDistance(route.distanceMeters)}</small></span>
                      <b>{formatDuration(route.durationSeconds)}</b>
                    </button>
                  );
                })}
              </div>
              <p className="route-disclaimer">Estimaciones de Geoapify según su red disponible; las condiciones reales pueden variar.</p>
            </section>
          )}
        </aside>

        <section className="map-panel" aria-label="Selección sobre el mapa">
          <Suspense fallback={<div className="map-loading" role="status"><LoaderCircle className="spin" aria-hidden="true" /> Cargando mapa de Lima…</div>}>
            <MapCanvas
              theme={isDark ? 'dark' : 'light'}
              origin={origin}
              destination={destination}
              userLocation={location.position}
              routes={routes}
              selectedMode={selectedMode}
              activeEndpoint={activeEndpoint}
              onMapSelect={(coordinates) => void selectFromMap(coordinates)}
              onError={setMessage}
            />
          </Suspense>
          {pointLoading && <div className="map-progress" role="status"><LoaderCircle className="spin" aria-hidden="true" /> Identificando el punto…</div>}
          {location.status === 'tracking' && (
            <div className="gps-status" role="status"><Navigation aria-hidden="true" /> GPS activo{location.accuracy ? ` · ±${Math.round(location.accuracy)} m` : ''}</div>
          )}
        </section>
      </div>
    </div>
  );
}
