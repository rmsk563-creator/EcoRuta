import { Capacitor } from '@capacitor/core';
import { Geolocation, type Position } from '@capacitor/geolocation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Coordinates } from '../services/geoapify/types';

type LocationStatus = 'idle' | 'requesting' | 'tracking' | 'denied' | 'error';

function toCoordinates(position: Position): Coordinates {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

function getLocationErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code === '1' || code === 'OS-PLUG-GLOC-0003') return 'No se concedió acceso a tu ubicación. Puedes elegir el origen en el mapa.';
  if (code === '2' || code === 'OS-PLUG-GLOC-0007' || code === 'OS-PLUG-GLOC-0017') return 'Activa los servicios de ubicación del dispositivo para usar el GPS.';
  if (code === '3' || code === 'OS-PLUG-GLOC-0010') return 'El GPS tardó demasiado en responder. Inténtalo en un lugar con mejor señal.';
  return 'No pudimos obtener tu ubicación. Puedes seleccionar el origen directamente en el mapa.';
}

export function useDeviceLocation() {
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState('');
  const watchId = useRef<string | null>(null);
  const mounted = useRef(true);

  const stop = useCallback(async () => {
    const id = watchId.current;
    watchId.current = null;
    if (id) await Geolocation.clearWatch({ id }).catch(() => undefined);
    if (mounted.current) setStatus('idle');
  }, []);

  const start = useCallback(async () => {
    if (status === 'requesting' || status === 'tracking') return;
    setStatus('requesting');
    setError('');

    if (!Capacitor.isNativePlatform() && !window.isSecureContext) {
      setStatus('error');
      setError('El GPS web requiere HTTPS o localhost. Abre EcoRuta mediante una conexión segura.');
      return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await Geolocation.requestPermissions({ permissions: ['location'] });
        if (permission.location !== 'granted') {
          setStatus('denied');
          setError('No se concedió acceso a tu ubicación. Puedes elegir el origen en el mapa.');
          return;
        }
      }

      const id = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 15_000,
          maximumAge: 5_000,
          minimumUpdateInterval: 5_000,
        },
        (result, watchError) => {
          if (!mounted.current) return;
          if (watchError || !result) {
            setStatus('error');
            setError(getLocationErrorMessage(watchError));
            return;
          }
          setPosition(toCoordinates(result));
          setAccuracy(result.coords.accuracy);
          setStatus('tracking');
          setError('');
        },
      );
      if (!mounted.current) {
        await Geolocation.clearWatch({ id });
        return;
      }
      watchId.current = id;
    } catch (locationError) {
      if (!mounted.current) return;
      const message = getLocationErrorMessage(locationError);
      setStatus(message.startsWith('No se concedió') ? 'denied' : 'error');
      setError(message);
    }
  }, [status]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const id = watchId.current;
      if (id) void Geolocation.clearWatch({ id });
    };
  }, []);

  return { status, position, accuracy, error, start, stop };
}
