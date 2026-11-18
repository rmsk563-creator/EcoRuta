import { Bike, Footprints, Heart, MapPin, Pencil, Route, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import type { Favorite } from '../data/types';
import type { MapNavigationState } from '../navigation/mapState';
import { useEcoRutaData } from '../state/DataContext';

type SortOption = 'recent' | 'name' | 'type';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, ready, error, clearError, renameFavorite, deleteFavorite } = useEcoRutaData();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const visibleFavorites = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es-PE');
    const matches = favorites.filter((favorite) => {
      const text = favorite.kind === 'place'
        ? `${favorite.name} ${favorite.place.label} ${favorite.place.detail}`
        : `${favorite.name} ${favorite.origin.label} ${favorite.destination.label} ${favorite.mode}`;
      return text.toLocaleLowerCase('es-PE').includes(normalized);
    });
    return matches.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'es');
      if (sort === 'type') return a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name, 'es');
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [favorites, query, sort]);

  const openOnMap = (favorite: Favorite) => {
    const state: MapNavigationState = favorite.kind === 'place'
      ? { destination: favorite.place, source: 'favorite' }
      : { origin: favorite.origin, destination: favorite.destination, preferredMode: favorite.mode, source: 'favorite' };
    navigate('/', { state });
  };

  const startEditing = (favorite: Favorite) => {
    setEditing(favorite.id);
    setName(favorite.name);
  };

  const saveName = async (id: string) => {
    if (!name.trim()) return;
    await renameFavorite(id, name);
    setEditing(null);
    setMessage('Nombre actualizado.');
  };

  const confirmDelete = async (id: string) => {
    await deleteFavorite(id);
    setDeleting(null);
    setMessage('Favorito eliminado.');
  };

  return (
    <div className="page collection-page">
      <header className="page-header page-header--compact collection-header">
        <div><p className="eyebrow"><Heart aria-hidden="true" /> Favoritos</p><h1>Lo que quieres tener cerca.</h1><p>Los lugares se abren como destino. Las rutas se recalculan con Geoapify cuando tú lo solicitas.</p></div>
        <span className="count-badge">{favorites.length} guardados</span>
      </header>

      {(error || message) && <div className="inline-notice" role="status"><p>{error || message}</p><button type="button" onClick={() => { clearError(); setMessage(''); }}>Cerrar</button></div>}

      {!ready ? <div className="data-loading" role="status">Cargando favoritos locales…</div> : favorites.length === 0 ? (
        <EmptyState icon={Heart} title="Aún no tienes favoritos" description="Guarda un lugar o una ruta después de calcularla en el mapa." actionLabel="Abrir el mapa" actionTo="/" />
      ) : (
        <>
          <div className="collection-toolbar">
            <label className="search-control"><Search aria-hidden="true" /><span className="sr-only">Buscar favoritos</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o lugar" /></label>
            <label className="select-control"><span>Ordenar</span><select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}><option value="recent">Más recientes</option><option value="name">Nombre</option><option value="type">Tipo</option></select></label>
          </div>

          {visibleFavorites.length === 0 ? (
            <EmptyState icon={Search} title="Sin coincidencias" description="Prueba con otro nombre, dirección o modalidad." />
          ) : (
            <div className="collection-list">
              {visibleFavorites.map((favorite) => {
                const route = favorite.kind === 'route';
                const ModeIcon = route && favorite.mode === 'bicycle' ? Bike : route ? Footprints : MapPin;
                return (
                  <article className="collection-card" key={favorite.id}>
                    <span className="collection-card__icon"><ModeIcon aria-hidden="true" /></span>
                    <div className="collection-card__body">
                      <span className="type-label">{route ? 'Ruta frecuente' : 'Lugar favorito'}</span>
                      {editing === favorite.id ? (
                        <form className="rename-form" onSubmit={(event) => { event.preventDefault(); void saveName(favorite.id); }}>
                          <label><span className="sr-only">Nombre personalizado</span><input autoFocus maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></label>
                          <button className="button button--primary button--small" type="submit" disabled={!name.trim()}>Guardar</button>
                          <button className="button button--quiet button--small" type="button" onClick={() => setEditing(null)}>Cancelar</button>
                        </form>
                      ) : <h2>{favorite.name}</h2>}
                      {route ? (
                        <p>{favorite.origin.label} <span aria-hidden="true">→</span> {favorite.destination.label}</p>
                      ) : <p>{favorite.place.label} · {favorite.place.detail}</p>}
                      {route && <small>{favorite.mode === 'walk' ? 'Caminando' : 'Bicicleta'} · el tiempo se actualizará al recalcular</small>}
                    </div>
                    <div className="collection-card__actions">
                      <button type="button" className="button button--primary button--small" onClick={() => openOnMap(favorite)}><Route aria-hidden="true" /> {route ? 'Recalcular' : 'Abrir en mapa'}</button>
                      <button type="button" className="icon-button" aria-label={`Editar ${favorite.name}`} onClick={() => startEditing(favorite)}><Pencil aria-hidden="true" /></button>
                      <button type="button" className="icon-button icon-button--danger" aria-label={`Eliminar ${favorite.name}`} onClick={() => setDeleting(favorite.id)}><Trash2 aria-hidden="true" /></button>
                    </div>
                    {deleting === favorite.id && (
                      <div className="card-confirm" role="group" aria-label={`Confirmar eliminación de ${favorite.name}`}><p>¿Eliminar este favorito?</p><div><button className="button button--quiet button--small" type="button" onClick={() => setDeleting(null)}>Cancelar</button><button className="button button--danger button--small" type="button" onClick={() => void confirmDelete(favorite.id)}>Eliminar</button></div></div>
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

