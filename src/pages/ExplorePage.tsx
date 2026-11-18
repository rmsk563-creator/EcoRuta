import {
  Building2,
  Check,
  Compass,
  Heart,
  Landmark,
  Leaf,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Navigation,
  Search,
  Trees,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFavoritePlace, toStoredPlace } from '../data/factories';
import { useDeviceLocation } from '../hooks/useDeviceLocation';
import { exploreLimaPlaces, searchLimaPlaces } from '../services/geoapify/client';
import { getGeoapifyErrorMessage } from '../services/geoapify/errors';
import type { ExploreCategory, ExplorePlace } from '../services/geoapify/types';
import { useEcoRutaData } from '../state/DataContext';
import { formatDistance } from '../utils/format';

const categories: Array<{ id: ExploreCategory; label: string; icon: typeof Trees }> = [
  { id: 'parks', label: 'Parques', icon: Trees },
  { id: 'culture', label: 'Cultura', icon: Building2 },
  { id: 'destinations', label: 'Destinos', icon: Landmark },
];

function categoryLabel(place: ExplorePlace) {
  if (place.categories.some((category) => category.startsWith('leisure.park'))) return 'Parque';
  if (place.categories.some((category) => category.includes('museum'))) return 'Museo';
  if (place.categories.some((category) => category.startsWith('entertainment.culture'))) return 'Espacio cultural';
  return 'Lugar de interés';
}

export function ExplorePage() {
  const navigate = useNavigate();
  const location = useDeviceLocation();
  const { favorites, saveFavorite } = useEcoRutaData();
  const [category, setCategory] = useState<ExploreCategory>('parks');
  const [places, setPlaces] = useState<ExplorePlace[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [savedId, setSavedId] = useState('');
  const activeRequest = useRef<AbortController | null>(null);

  const loadCategory = useCallback((nextCategory: ExploreCategory, userPosition = location.position) => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setMessage('');
    exploreLimaPlaces(nextCategory, userPosition, controller.signal)
      .then(setPlaces)
      .catch((error: unknown) => {
        const nextMessage = getGeoapifyErrorMessage(error);
        if (nextMessage) setMessage(nextMessage);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }, [location.position]);

  useEffect(() => {
    loadCategory(category);
    return () => activeRequest.current?.abort();
  }, [category, loadCategory]);

  const search = async (event: FormEvent) => {
    event.preventDefault();
    if (query.trim().length < 3) {
      setMessage('Escribe al menos tres caracteres para buscar un lugar en Lima.');
      return;
    }
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setMessage('');
    try {
      const results = await searchLimaPlaces(query, controller.signal);
      setPlaces(results.map((place) => ({ ...place, categories: [] })));
      if (results.length === 0) setMessage('No encontramos coincidencias dentro de Lima. Prueba con otra dirección o lugar.');
    } catch (error) {
      const nextMessage = getGeoapifyErrorMessage(error);
      if (nextMessage) setMessage(nextMessage);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const favoriteCoordinates = useMemo(() => new Set(favorites.flatMap((favorite) => {
    const place = favorite.kind === 'place' ? favorite.place : favorite.destination;
    return [`${place.latitude.toFixed(5)},${place.longitude.toFixed(5)}`];
  })), [favorites]);

  const save = async (place: ExplorePlace) => {
    try {
      await saveFavorite(createFavoritePlace(place));
      setSavedId(place.id);
      window.setTimeout(() => setSavedId(''), 1800);
    } catch {
      setMessage('Este lugar ya está guardado o el almacenamiento local no está disponible.');
    }
  };

  return (
    <div className="page explore-page">
      <header className="explore-hero">
        <div>
          <p className="eyebrow"><Compass aria-hidden="true" /> Explorar Lima</p>
          <h1>Encuentra un nuevo destino.</h1>
          <p>Lugares reales obtenidos de Geoapify. EcoRuta no añade valoraciones ni información inventada.</p>
        </div>
        <span className="explore-hero__mark" aria-hidden="true"><Leaf /></span>
      </header>

      <form className="explore-search" role="search" onSubmit={(event) => void search(event)}>
        <Search aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Parque, museo o destino" enterKeyHint="search" aria-label="Buscar lugares en Lima" />
        <button type="submit" disabled={loading || query.trim().length < 3}>Buscar</button>
      </form>

      <div className="explore-toolbar">
        <div className="explore-categories" role="radiogroup" aria-label="Categorías de lugares">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={category === id}
              className={category === id && !query ? 'is-active' : ''}
              onClick={() => {
                setQuery('');
                setCategory(id);
              }}
            >
              <Icon aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`explore-location${location.status === 'tracking' ? ' is-active' : ''}`}
          onClick={() => location.status === 'tracking' ? void location.stop() : void location.start()}
          disabled={location.status === 'requesting'}
        >
          {location.status === 'requesting' ? <LoaderCircle className="spin" aria-hidden="true" /> : <LocateFixed aria-hidden="true" />}
          {location.status === 'tracking' ? 'Cerca de mí' : 'Usar ubicación'}
        </button>
      </div>

      {(message || location.error) && <div className="explore-message" role="status"><MapPin aria-hidden="true" /><p>{location.error || message}</p></div>}

      <section className="explore-results" aria-labelledby="explore-results-title" aria-busy={loading}>
        <div className="explore-results__heading">
          <div><p className="kicker">Resultados reales</p><h2 id="explore-results-title">{query ? `Coincidencias para “${query.trim()}”` : categories.find((item) => item.id === category)?.label}</h2></div>
          <span>Geoapify</span>
        </div>

        {loading ? (
          <div className="explore-loading" role="status"><LoaderCircle className="spin" aria-hidden="true" /> Consultando lugares…</div>
        ) : places.length > 0 ? (
          <div className="explore-list">
            {places.map((place) => {
              const coordinateKey = `${place.coordinates.latitude.toFixed(5)},${place.coordinates.longitude.toFixed(5)}`;
              const saved = favoriteCoordinates.has(coordinateKey) || savedId === place.id;
              return (
                <article className="place-card" key={place.id}>
                  <span className="place-card__icon" aria-hidden="true"><MapPin /></span>
                  <div className="place-card__copy">
                    <p>{categoryLabel(place)}{typeof place.distanceMeters === 'number' ? ` · ${formatDistance(place.distanceMeters, 'metric')}` : ''}</p>
                    <h3>{place.label}</h3>
                    <span>{place.detail}</span>
                  </div>
                  <div className="place-card__actions">
                    <button type="button" className="button button--primary button--small" onClick={() => navigate('/', { state: { destination: toStoredPlace(place) } })}><Navigation aria-hidden="true" /> Cómo llegar</button>
                    <button type="button" className="place-card__save" disabled={saved} onClick={() => void save(place)} aria-label={saved ? `${place.label} guardado` : `Guardar ${place.label}`}>
                      {saved ? <Check aria-hidden="true" /> : <Heart aria-hidden="true" />}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : !message && <div className="explore-empty"><MapPin aria-hidden="true" /><p>No hay resultados disponibles para esta selección.</p></div>}
      </section>

      <p className="explore-attribution">Los nombres, direcciones, categorías y distancias mostradas provienen de Geoapify y OpenStreetMap. La distancia solo aparece cuando utilizas tu ubicación.</p>
    </div>
  );
}
