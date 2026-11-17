import { describe, expect, it } from 'vitest';
import type { CompletedTrip } from './types';
import { calculatePeriodStatistics, calculateTotals } from './statistics';

function trip(overrides: Partial<CompletedTrip>): CompletedTrip {
  return {
    id: crypto.randomUUID(),
    recordType: 'completed-trip',
    origin: { label: 'Origen', detail: 'Lima', latitude: -12.04, longitude: -77.03 },
    destination: { label: 'Destino', detail: 'Lima', latitude: -12.1, longitude: -77.02 },
    mode: 'walk',
    distanceMeters: 2_000,
    durationSeconds: 1_800,
    completedAt: '2026-11-17T12:00:00-05:00',
    createdAt: '2026-11-17T12:00:00-05:00',
    provider: 'geoapify',
    wouldReplaceCar: false,
    ...overrides,
  };
}

describe('personal statistics', () => {
  it('calculates totals by mode and environmental estimate only for car replacements', () => {
    const totals = calculateTotals([
      trip({ mode: 'walk', distanceMeters: 2_000, durationSeconds: 1_800, wouldReplaceCar: true }),
      trip({ mode: 'bicycle', distanceMeters: 5_000, durationSeconds: 1_200, wouldReplaceCar: false }),
    ]);
    expect(totals).toMatchObject({
      trips: 2,
      distanceMeters: 7_000,
      durationSeconds: 3_000,
      walkMeters: 2_000,
      bicycleMeters: 5_000,
      carReplacementMeters: 2_000,
      avoidedCo2Kg: 0.4,
    });
  });

  it('filters weekly and monthly activity and compares periods', () => {
    const trips = [
      trip({ completedAt: '2026-11-17T12:00:00-05:00', distanceMeters: 4_000 }),
      trip({ completedAt: '2026-11-10T12:00:00-05:00', distanceMeters: 2_000 }),
      trip({ completedAt: '2026-10-20T12:00:00-05:00', distanceMeters: 1_000 }),
    ];
    const weekly = calculatePeriodStatistics(trips, 'week', new Date('2026-11-17T18:00:00-05:00'));
    expect(weekly.current.trips).toBe(1);
    expect(weekly.previous.trips).toBe(1);
    expect(weekly.distanceChangePercent).toBe(100);
    expect(weekly.chart).toHaveLength(7);

    const monthly = calculatePeriodStatistics(trips, 'month', new Date('2026-11-17T18:00:00-05:00'));
    expect(monthly.current.trips).toBe(2);
    expect(monthly.previous.trips).toBe(1);
    expect(monthly.chart.length).toBeGreaterThanOrEqual(4);
  });

  it('returns zeroed statistics without inventing activity', () => {
    const result = calculatePeriodStatistics([], 'year', new Date('2026-11-17T18:00:00-05:00'));
    expect(result.current.trips).toBe(0);
    expect(result.current.avoidedCo2Kg).toBe(0);
    expect(result.chart.every((point) => point.distanceMeters === 0)).toBe(true);
  });
});

