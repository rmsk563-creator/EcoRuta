import * as maplibregl from 'maplibre-gl';
import type { ErrorEvent as MapLibreErrorEvent, GeoJSONSource, Map as MapLibreMap, MapMouseEvent, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef } from 'react';
import { getGeoapifyStyleUrl, LIMA_BOUNDS, LIMA_CENTER } from '../../config/geoapify';
import type { Coordinates, EndpointRole, PlaceSelection, RouteMode, RouteResult } from '../../services/geoapify/types';

interface MapCanvasProps {
  theme: 'light' | 'dark';
  origin: PlaceSelection | null;
  destination: PlaceSelection | null;
  userLocation: Coordinates | null;
  routes: RouteResult[];
  selectedMode: RouteMode;
  activeEndpoint: EndpointRole;
  onMapSelect: (coordinates: Coordinates) => void;
  onError: (message: string) => void;
}

const ROUTE_STYLES: Record<RouteMode, { color: string; label: string }> = {
  walk: { color: '#087f5b', label: 'Ruta a pie' },
  bicycle: { color: '#1f78b4', label: 'Ruta en bicicleta' },
};

function createMarker(label: string, kind: 'origin' | 'destination' | 'user') {
  const element = document.createElement('div');
  const text = document.createElement('span');
  element.className = `map-marker map-marker--${kind}`;
  text.textContent = label;
  element.append(text);
  element.setAttribute('aria-label', kind === 'user' ? 'Tu ubicación' : kind === 'origin' ? 'Origen' : 'Destino');
  return element;
}

function setMarker(
  current: Marker | null,
  map: MapLibreMap,
  coordinates: Coordinates | null,
  label: string,
  kind: 'origin' | 'destination' | 'user',
) {
  if (!coordinates) {
    current?.remove();
    return null;
  }
  const marker = current ?? new maplibregl.Marker({ element: createMarker(label, kind), anchor: 'center' }).addTo(map);
  marker.setLngLat([coordinates.longitude, coordinates.latitude]);
  return marker;
}

function routeFeature(route: RouteResult) {
  return {
    type: 'Feature' as const,
    properties: { mode: route.mode },
    geometry: route.geometry,
  };
}

function ensureRouteLayers(map: MapLibreMap) {
  (Object.keys(ROUTE_STYLES) as RouteMode[]).forEach((mode) => {
    const sourceId = `ecoruta-${mode}`;
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }
    if (!map.getLayer(sourceId)) {
      map.addLayer({
        id: sourceId,
        type: 'line',
        source: sourceId,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ROUTE_STYLES[mode].color,
          'line-width': 5,
          'line-opacity': 0.82,
        },
      });
    }
  });
}

function allRouteCoordinates(routes: RouteResult[]) {
  return routes.flatMap((route) => (
    route.geometry.type === 'LineString'
      ? route.geometry.coordinates as number[][]
      : (route.geometry.coordinates as number[][][]).flat()
  ));
}

export function MapCanvas(props: MapCanvasProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const loaded = useRef(false);
  const originMarker = useRef<Marker | null>(null);
  const destinationMarker = useRef<Marker | null>(null);
  const userMarker = useRef<Marker | null>(null);
  const selectHandler = useRef(props.onMapSelect);
  const errorHandler = useRef(props.onError);

  selectHandler.current = props.onMapSelect;
  errorHandler.current = props.onError;

  useEffect(() => {
    if (!container.current) return undefined;
    const instance = new maplibregl.Map({
      container: container.current,
      style: getGeoapifyStyleUrl(props.theme),
      center: [LIMA_CENTER.longitude, LIMA_CENTER.latitude],
      zoom: 11.2,
      minZoom: 9,
      maxZoom: 20,
      maxBounds: [[LIMA_BOUNDS.west, LIMA_BOUNDS.south], [LIMA_BOUNDS.east, LIMA_BOUNDS.north]],
      attributionControl: { compact: true },
    });
    map.current = instance;
    instance.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    instance.on('load', () => {
      loaded.current = true;
      ensureRouteLayers(instance);
    });
    instance.on('click', (event: MapMouseEvent) => {
      selectHandler.current({ longitude: event.lngLat.lng, latitude: event.lngLat.lat });
    });
    instance.on('error', (event: MapLibreErrorEvent) => {
      if (event.error?.message) errorHandler.current('El mapa no pudo cargar todos sus datos. Revisa la API key, sus restricciones y tu conexión.');
    });
    return () => {
      loaded.current = false;
      originMarker.current?.remove();
      destinationMarker.current?.remove();
      userMarker.current?.remove();
      originMarker.current = null;
      destinationMarker.current = null;
      userMarker.current = null;
      instance.remove();
      map.current = null;
    };
  }, [props.theme]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const update = () => {
      originMarker.current = setMarker(originMarker.current, instance, props.origin?.coordinates ?? null, 'A', 'origin');
      destinationMarker.current = setMarker(destinationMarker.current, instance, props.destination?.coordinates ?? null, 'B', 'destination');
      userMarker.current = setMarker(userMarker.current, instance, props.userLocation, '', 'user');
      ensureRouteLayers(instance);
      (Object.keys(ROUTE_STYLES) as RouteMode[]).forEach((mode) => {
        const route = props.routes.find((candidate) => candidate.mode === mode);
        const source = instance.getSource(`ecoruta-${mode}`) as GeoJSONSource | undefined;
        source?.setData({
          type: 'FeatureCollection',
          features: route ? [routeFeature(route)] : [],
        });
        instance.setPaintProperty(`ecoruta-${mode}`, 'line-width', mode === props.selectedMode ? 7 : 4);
        instance.setPaintProperty(`ecoruta-${mode}`, 'line-opacity', mode === props.selectedMode ? 0.96 : 0.58);
      });
      const coordinates = allRouteCoordinates(props.routes);
      if (coordinates.length > 1) {
        const bounds = coordinates.reduce(
          (value, coordinate) => value.extend(coordinate as [number, number]),
          new maplibregl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]),
        );
        instance.fitBounds(bounds, { padding: 72, maxZoom: 15, duration: 650 });
      }
    };
    if (loaded.current) update();
    else instance.once('load', update);
  }, [props.destination, props.origin, props.routes, props.selectedMode, props.userLocation]);

  return (
    <div className="map-canvas-wrap">
      <div ref={container} className="map-canvas" aria-label="Mapa interactivo de Lima" />
      <p className="map-selection-hint" aria-live="polite">
        Toca el mapa para elegir {props.activeEndpoint === 'origin' ? 'el origen' : 'el destino'}.
      </p>
    </div>
  );
}
