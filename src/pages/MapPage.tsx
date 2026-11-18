import {
  AlertCircle,
  Bike,
  CheckCircle2,
  Footprints,
  Heart,
  KeyRound,
  LoaderCircle,
  LocateFixed,
  MapPinned,
  Navigation,
  RefreshCw,
  Route,
  Save,
  Square,
} from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { ExternalLinkAnchor } from '../components/ExternalLinkAnchor';
import { PlaceSearchField } from '../components/map/PlaceSearchField';
import { MapErrorBoundary } from '../components/map/MapErrorBoundary';
import { RouteSheet, type RouteSheetState } from '../components/map/RouteSheet';
import { isGeoapifyConfigured } from '../config/geoapify';
import { createCompletedTrip, createFavoritePlace, createFavoriteRoute, toPlaceSelection } from '../data/factories';
import { useDeviceLocation } from '../hooks/useDeviceLocation';
import { getNavigationActiveEndpoint, isMapNavigationState } from '../navigation/mapState';
import { calculateRoute, reverseGeocodeLima } from '../services/geoapify/client';
import { getGeoapifyErrorMessage } from '../services/geoapify/errors';
import type { Coordinates, EndpointRole, PlaceSelection, RouteMode, RouteResult } from '../services/geoapify/types';
import { useEcoRutaData } from '../state/DataContext';
import { usePreferences } from '../state/PreferencesContext';
import { formatDistance, formatDuration } from '../utils/format';

const MapCanvas = lazy(() => import('../components/map/MapCanvas').then((module) => ({ default: module.MapCanvas })));

function coordinatePlace(coordinates: Coordinates): PlaceSelection {
  const detail = `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`;
  return { id: `coordinate:${detail}`, label: 'Punto seleccionado', detail, coordinates };
}

export function MapPage() {
  const { preferences } = usePreferences();
  const { saveFavorite, saveTrip } = useEcoRutaData();
  const routerLocation = useRouterLocation();
  const location = useDeviceLocation();
  const [origin, setOrigin] = useState<PlaceSelection | null>(null);
  const [destination, setDestination] = useState<PlaceSelection | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState<EndpointRole>('destination');
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [selectedMode, setSelectedMode] = useState<RouteMode>(preferences.preferredMode);
  const [routeLoading, setRouteLoading] = useState(false);
  const [pointLoading, setPointLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [recordConfirmation, setRecordConfirmation] = useState(false);
  const [wouldReplaceCar, setWouldReplaceCar] = useState(false);
  const [sheetState, setSheetState] = useState<RouteSheetState>('compact');
  const request = useRef<AbortController | null>(null);
  const navigationApplied = useRef(false);

  const selectedRoute = useMemo(
    () => routes.find((route) => route.mode === selectedMode) ?? routes[0] ?? null,
    [routes, selectedMode],
  );

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
    if (navigationApplied.current || routerLocation.state === null || routerLocation.state === undefined) return;
    navigationApplied.current = true;
    if (!isMapNavigationState(routerLocation.state)) {
      setMessage('No pudimos abrir este elemento guardado porque le faltan coordenadas válidas. Vuelve a seleccionarlo o edítalo desde Favoritos.');
      return;
    }
    const state = routerLocation.state;
    if (state.origin) setOrigin(toPlaceSelection(state.origin));
    if (state.destination) setDestination(toPlaceSelection(state.destination));
    if (state.preferredMode) setSelectedMode(state.preferredMode);
    setRoutes([]);
    setMessage('');
    setActiveEndpoint(getNavigationActiveEndpoint(state));
  }, [routerLocation.state]);

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

  useEffect(() => {
    if (destination) setSheetState((current) => current === 'compact' ? 'medium' : current);
  }, [destination]);

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
    if (available.length > 0) setSheetState('expanded');
    if (available.length > 0 && !available.some((route) => route.mode === selectedMode)) setSelectedMode(available[0]!.mode);
    if (available.length === 0) setMessage(failures[0] || 'No se encontraron rutas sostenibles entre los puntos elegidos.');
    else if (failures.length > 0) setMessage(`Se calculó ${available.length === 1 ? 'una modalidad' : 'parte de la comparación'}. ${failures[0]}`);
    setRouteLoading(false);
  };

  const persistFavorite = async (kind: 'place' | 'route') => {
    if (!destination || (kind === 'route' && (!origin || !selectedRoute))) return;
    setSaving(true);
    try {
      const favorite = kind === 'place'
        ? createFavoritePlace(destination)
        : createFavoriteRoute(origin!, destination, selectedRoute!.mode);
      await saveFavorite(favorite);
      setMessage(kind === 'place' ? 'Destino guardado en Favoritos.' : 'Ruta guardada. Se recalculará cuando vuelvas a utilizarla.');
    } catch {
      setMessage('No se pudo guardar. Es posible que este favorito ya exista o que el almacenamiento no esté disponible.');
    } finally {
      setSaving(false);
    }
  };

  const confirmCompletedTrip = async () => {
    if (!origin || !destination || !selectedRoute) return;
    setSaving(true);
    try {
      await saveTrip(createCompletedTrip(origin, destination, selectedRoute, wouldReplaceCar));
      setRecordConfirmation(false);
      setWouldReplaceCar(false);
      setMessage('Recorrido registrado como realizado. Ya forma parte de tu historial y estadísticas.');
    } catch {
      setMessage('No se pudo registrar el recorrido en este dispositivo.');
    } finally {
      setSaving(false);
    }
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
              <li>Crea una cuenta gratuita en <ExternalLinkAnchor href="https://myprojects.geoapify.com/">Geoapify MyProjects</ExternalLinkAnchor>.</li>
              <li>Crea un proyecto y copia la API key generada en la sección “API Keys”.</li>
              <li>Copia <code>.env.example</code> como <code>.env.local</code> y completa <code>VITE_GEOAPIFY_API_KEY</code>.</li>
              <li>Reinicia <code>npm run dev</code>. Vite lee variables de entorno solo al iniciar.</li>
            </ol>
            <div className="provider-setup__security">
              <CheckCircle2 aria-hidden="true" />
              <p>En web, restringe una clave dedicada por HTTP referrer/origin. En iOS, trata la clave compilada como pública, usa otra clave dedicada, controla su cuota y revisa su uso en Geoapify.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`page map-page map-page--sheet-${sheetState}`}>
      <div className="route-planner">
        <section className="map-panel" aria-label="Selección sobre el mapa">
          <MapErrorBoundary>
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
          </MapErrorBoundary>

          <div className="map-floating-search">
            <PlaceSearchField
              label="Destino"
              placeholder="¿A dónde quieres ir?"
              selection={destination}
              onChange={(place) => changeEndpoint('destination', place)}
              onError={setMessage}
            />
          </div>

          <button
            type="button"
            className={`map-gps-button${location.status === 'tracking' ? ' is-active' : ''}`}
            onClick={() => location.status === 'tracking' ? void location.stop() : void location.start()}
            disabled={location.status === 'requesting'}
            aria-label={location.status === 'tracking' ? 'Detener ubicación en tiempo real' : 'Usar mi ubicación actual'}
          >
            {location.status === 'requesting' ? <LoaderCircle className="spin" aria-hidden="true" /> : location.status === 'tracking' ? <Square aria-hidden="true" /> : <LocateFixed aria-hidden="true" />}
          </button>

          {(location.error || message) && (
            <div className="map-alert" role="alert">
              <AlertCircle aria-hidden="true" />
              <p>{location.error || message}</p>
              {message && <button type="button" onClick={() => setMessage('')} aria-label="Cerrar aviso">Cerrar</button>}
            </div>
          )}

          {pointLoading && <div className="map-progress" role="status"><LoaderCircle className="spin" aria-hidden="true" /> Identificando el punto…</div>}
          {location.status === 'tracking' && (
            <div className="gps-status" role="status"><Navigation aria-hidden="true" /> GPS activo{location.accuracy ? ` · ±${Math.round(location.accuracy)} m` : ''}</div>
          )}
        </section>

        <RouteSheet
          state={sheetState}
          onStateChange={setSheetState}
          title={destination?.label ?? 'Planifica tu EcoRuta'}
          detail={origin
            ? `Desde ${origin.label}`
            : destination
              ? 'Elige un origen para comparar rutas'
              : 'Busca un destino o selecciónalo en el mapa'}
        >
          <div className="endpoint-selector" role="radiogroup" aria-label="Punto que se seleccionará en el mapa">
            <button type="button" role="radio" aria-checked={activeEndpoint === 'origin'} className={activeEndpoint === 'origin' ? 'is-active' : ''} onClick={() => setActiveEndpoint('origin')}>Origen</button>
            <button type="button" role="radio" aria-checked={activeEndpoint === 'destination'} className={activeEndpoint === 'destination' ? 'is-active' : ''} onClick={() => setActiveEndpoint('destination')}>Destino</button>
          </div>

          <PlaceSearchField label="Origen" placeholder="Calle, dirección o lugar" selection={origin} onChange={(place) => changeEndpoint('origin', place)} onError={setMessage} />
          <div className={`route-sheet__destination${destination ? ' has-selection' : ''}`}>
            <MapPinned aria-hidden="true" />
            <span>
              <small>Destino</small>
              <strong>{destination?.label ?? 'Busca un destino en el mapa'}</strong>
            </span>
          </div>
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
                      <span><strong>{route.mode === 'walk' ? 'Caminar' : 'Bicicleta'}</strong><small>{formatDistance(route.distanceMeters, preferences.distanceUnit === 'kilometers' ? 'kilometers' : 'metric')}</small></span>
                      <b>{formatDuration(route.durationSeconds)}</b>
                    </button>
                  );
                })}
              </div>
              <div className="route-result-actions">
                <button type="button" className="button button--quiet button--small" disabled={saving} onClick={() => void persistFavorite('place')}><Heart aria-hidden="true" /> Guardar destino</button>
                <button type="button" className="button button--quiet button--small" disabled={saving || !selectedRoute} onClick={() => void persistFavorite('route')}><Save aria-hidden="true" /> Guardar ruta</button>
                {preferences.allowTripStorage && <button type="button" className="button button--primary button--small" disabled={saving || !selectedRoute} onClick={() => setRecordConfirmation(true)}><Route aria-hidden="true" /> Registrar como realizado</button>}
              </div>
              {recordConfirmation && selectedRoute && (
                <div className="record-confirmation" role="group" aria-label="Confirmar recorrido realizado">
                  <strong>¿Realizaste este recorrido?</strong>
                  <p>Se guardarán la fecha actual, origen, destino, modalidad, distancia y duración calculadas por Geoapify. Esto es distinto de consultar una ruta.</p>
                  <label><input type="checkbox" checked={wouldReplaceCar} onChange={(event) => setWouldReplaceCar(event.target.checked)} /> Este recorrido sustituyó un viaje que habría hecho en automóvil</label>
                  <div><button type="button" className="button button--quiet button--small" onClick={() => setRecordConfirmation(false)}>Cancelar</button><button type="button" className="button button--primary button--small" disabled={saving} onClick={() => void confirmCompletedTrip()}>{saving ? 'Guardando…' : 'Sí, registrar'}</button></div>
                </div>
              )}
              <p className="route-disclaimer">Estimaciones de Geoapify según su red disponible; las condiciones reales pueden variar.</p>
            </section>
          )}
        </RouteSheet>
      </div>
    </div>
  );
}
