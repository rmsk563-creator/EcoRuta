export const geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY?.trim() ?? '';

export const isGeoapifyConfigured = geoapifyApiKey.length > 0;

export const LIMA_CENTER = {
  longitude: -77.0428,
  latitude: -12.0464,
} as const;

export const LIMA_BOUNDS = {
  west: -77.25,
  south: -12.36,
  east: -76.7,
  north: -11.7,
} as const;

export function getGeoapifyStyleUrl(theme: 'light' | 'dark') {
  const style = theme === 'dark' ? 'dark-matter' : 'osm-bright';
  return `https://maps.geoapify.com/v1/styles/${style}/style.json?apiKey=${encodeURIComponent(geoapifyApiKey)}`;
}
