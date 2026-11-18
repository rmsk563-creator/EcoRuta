import { describe, expect, it } from 'vitest';
import { resolveRouteSheetState } from './RouteSheet';

describe('RouteSheet gesture states', () => {
  it('opens one level when the user drags upward', () => {
    expect(resolveRouteSheetState('compact', -70, 0)).toBe('medium');
    expect(resolveRouteSheetState('medium', -70, 0)).toBe('expanded');
  });

  it('closes one level when the user drags downward', () => {
    expect(resolveRouteSheetState('expanded', 70, 0)).toBe('medium');
    expect(resolveRouteSheetState('medium', 70, 0)).toBe('compact');
  });

  it('uses gesture velocity without skipping levels', () => {
    expect(resolveRouteSheetState('compact', -8, -0.5)).toBe('medium');
    expect(resolveRouteSheetState('expanded', 8, 0.5)).toBe('medium');
  });

  it('keeps the current state after a small, slow movement', () => {
    expect(resolveRouteSheetState('medium', 12, 0.02)).toBe('medium');
  });
});
