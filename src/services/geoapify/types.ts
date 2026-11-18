export interface Coordinates {
  longitude: number;
  latitude: number;
}

export interface PlaceSelection {
  id: string;
  label: string;
  detail: string;
  coordinates: Coordinates;
}

export interface ExplorePlace extends PlaceSelection {
  categories: string[];
  distanceMeters?: number;
}

export type ExploreCategory = 'parks' | 'culture' | 'destinations';

export type RouteMode = 'walk' | 'bicycle';

export interface RouteGeometry {
  type: 'LineString' | 'MultiLineString';
  coordinates: number[][] | number[][][];
}

export interface RouteResult {
  mode: RouteMode;
  distanceMeters: number;
  durationSeconds: number;
  geometry: RouteGeometry;
}

export type EndpointRole = 'origin' | 'destination';
