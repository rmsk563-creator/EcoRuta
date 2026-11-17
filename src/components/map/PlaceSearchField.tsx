import { LoaderCircle, MapPin, Search, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { getGeoapifyErrorMessage } from '../../services/geoapify/errors';
import { searchLimaPlaces } from '../../services/geoapify/client';
import type { PlaceSelection } from '../../services/geoapify/types';

interface PlaceSearchFieldProps {
  label: string;
  placeholder: string;
  selection: PlaceSelection | null;
  onChange: (selection: PlaceSelection | null) => void;
  onError: (message: string) => void;
}

export function PlaceSearchField({ label, placeholder, selection, onChange, onError }: PlaceSearchFieldProps) {
  const listId = useId();
  const [query, setQuery] = useState(selection?.label ?? '');
  const [suggestions, setSuggestions] = useState<PlaceSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(selection?.label ?? '');
  }, [selection]);

  useEffect(() => {
    if (selection || query.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      searchLimaPlaces(query, controller.signal)
        .then((results) => {
          setSuggestions(results);
          setOpen(true);
        })
        .catch((error: unknown) => {
          const message = getGeoapifyErrorMessage(error);
          if (message) onError(message);
        })
        .finally(() => setLoading(false));
    }, 420);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [onError, query, selection]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const updateQuery = (value: string) => {
    setQuery(value);
    setOpen(true);
    if (selection) onChange(null);
  };

  const clear = () => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    onChange(null);
  };

  return (
    <div className="place-field" ref={wrapper}>
      <label htmlFor={`${listId}-input`}>{label}</label>
      <div className="place-field__control">
        <Search aria-hidden="true" />
        <input
          id={`${listId}-input`}
          type="search"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
          onChange={(event) => updateQuery(event.target.value)}
          onFocus={() => setOpen(true)}
        />
        {loading && <LoaderCircle className="place-field__loader" aria-label="Buscando" />}
        {query && !loading && (
          <button type="button" onClick={clear} aria-label={`Limpiar ${label.toLowerCase()}`}>
            <X aria-hidden="true" />
          </button>
        )}
      </div>
      {open && query.trim().length >= 3 && (
        <div className="place-suggestions" id={listId} role="listbox" aria-label={`Resultados para ${label.toLowerCase()}`}>
          {suggestions.length > 0 ? suggestions.map((place) => (
            <button
              type="button"
              role="option"
              aria-selected="false"
              key={place.id}
              onClick={() => {
                onChange(place);
                setOpen(false);
              }}
            >
              <MapPin aria-hidden="true" />
              <span><strong>{place.label}</strong><small>{place.detail}</small></span>
            </button>
          )) : !loading && <p>No encontramos coincidencias dentro de Lima.</p>}
        </div>
      )}
    </div>
  );
}
