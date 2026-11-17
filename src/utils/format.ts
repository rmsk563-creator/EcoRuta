export function formatDistance(meters: number, unit: 'metric' | 'kilometers' = 'metric') {
  if (unit === 'metric' && meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toLocaleString('es-PE', { maximumFractionDigits: 1 })} km`;
}

export function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

