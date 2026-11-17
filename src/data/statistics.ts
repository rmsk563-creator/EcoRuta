import type { CompletedTrip } from './types';

export type StatisticsPeriod = 'week' | 'month' | 'year';

export const CAR_CO2_KG_PER_KM = 0.2;
export const CAR_CO2_SOURCE_URL = 'https://cdn.www.gob.pe/uploads/document/file/7532063/6402674-anexo-resolucion-directoral-n-001-2025-mtc-18.pdf?v=1737659691';

export interface StatisticsTotals {
  trips: number;
  distanceMeters: number;
  durationSeconds: number;
  walkMeters: number;
  bicycleMeters: number;
  carReplacementMeters: number;
  avoidedCo2Kg: number;
}

export interface ChartPoint {
  key: string;
  label: string;
  distanceMeters: number;
  trips: number;
}

export interface PeriodStatistics {
  period: StatisticsPeriod;
  current: StatisticsTotals;
  previous: StatisticsTotals;
  distanceChangePercent: number | null;
  chart: ChartPoint[];
  currentTrips: CompletedTrip[];
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const start = startOfDay(date);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  return start;
}

function periodBounds(period: StatisticsPeriod, now: Date) {
  if (period === 'week') {
    const start = startOfWeek(now);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - 7);
    return { start, end, previousStart, previousEnd: start };
  }
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { start, end, previousStart, previousEnd: start };
  }
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  const previousStart = new Date(now.getFullYear() - 1, 0, 1);
  return { start, end, previousStart, previousEnd: start };
}

export function calculateTotals(trips: CompletedTrip[]): StatisticsTotals {
  const totals = trips.reduce<StatisticsTotals>((result, trip) => {
    result.trips += 1;
    result.distanceMeters += trip.distanceMeters;
    result.durationSeconds += trip.durationSeconds;
    if (trip.mode === 'walk') result.walkMeters += trip.distanceMeters;
    else result.bicycleMeters += trip.distanceMeters;
    if (trip.wouldReplaceCar) result.carReplacementMeters += trip.distanceMeters;
    return result;
  }, {
    trips: 0,
    distanceMeters: 0,
    durationSeconds: 0,
    walkMeters: 0,
    bicycleMeters: 0,
    carReplacementMeters: 0,
    avoidedCo2Kg: 0,
  });
  totals.avoidedCo2Kg = (totals.carReplacementMeters / 1000) * CAR_CO2_KG_PER_KM;
  return totals;
}

function inRange(trip: CompletedTrip, start: Date, end: Date) {
  const timestamp = Date.parse(trip.completedAt);
  return timestamp >= start.getTime() && timestamp < end.getTime();
}

function buildChart(period: StatisticsPeriod, trips: CompletedTrip[], start: Date): ChartPoint[] {
  const formatter = new Intl.DateTimeFormat('es-PE', period === 'year' ? { month: 'short' } : { weekday: 'short', day: 'numeric' });
  const count = period === 'week' ? 7 : period === 'month' ? Math.ceil(new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate() / 7) : 12;
  return Array.from({ length: count }, (_, index) => {
    let pointStart: Date;
    let pointEnd: Date;
    if (period === 'week') {
      pointStart = new Date(start);
      pointStart.setDate(start.getDate() + index);
      pointEnd = new Date(pointStart);
      pointEnd.setDate(pointEnd.getDate() + 1);
    } else if (period === 'month') {
      pointStart = new Date(start);
      pointStart.setDate(1 + index * 7);
      pointEnd = new Date(pointStart);
      pointEnd.setDate(pointEnd.getDate() + 7);
      const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      if (pointEnd > monthEnd) pointEnd = monthEnd;
    } else {
      pointStart = new Date(start.getFullYear(), index, 1);
      pointEnd = new Date(start.getFullYear(), index + 1, 1);
    }
    const matches = trips.filter((trip) => inRange(trip, pointStart, pointEnd));
    return {
      key: pointStart.toISOString(),
      label: period === 'month' ? `Sem ${index + 1}` : formatter.format(pointStart).replace('.', ''),
      distanceMeters: matches.reduce((total, trip) => total + trip.distanceMeters, 0),
      trips: matches.length,
    };
  });
}

export function calculatePeriodStatistics(trips: CompletedTrip[], period: StatisticsPeriod, now = new Date()): PeriodStatistics {
  const bounds = periodBounds(period, now);
  const currentTrips = trips.filter((trip) => inRange(trip, bounds.start, bounds.end));
  const previousTrips = trips.filter((trip) => inRange(trip, bounds.previousStart, bounds.previousEnd));
  const current = calculateTotals(currentTrips);
  const previous = calculateTotals(previousTrips);
  const distanceChangePercent = previous.distanceMeters === 0
    ? null
    : ((current.distanceMeters - previous.distanceMeters) / previous.distanceMeters) * 100;
  return {
    period,
    current,
    previous,
    distanceChangePercent,
    chart: buildChart(period, currentTrips, bounds.start),
    currentTrips,
  };
}

