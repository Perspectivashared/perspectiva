import { describe, it, expect } from 'vitest';
import { scatterPositions, resolvedPositions, lerpPositions, markTone } from './markLayout';

describe('markLayout', () => {
  it('scatterPositions is deterministic for a given seed', () => {
    const a = scatterPositions(50, 7);
    const b = scatterPositions(50, 7);
    expect(a).toEqual(b);
    expect(a).toHaveLength(50);
    expect(a.every((p) => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1)).toBe(true);
  });

  it('different seeds give different scatter', () => {
    expect(scatterPositions(50, 1)).not.toEqual(scatterPositions(50, 2));
  });

  it('resolvedPositions grid returns count points in [0,1]', () => {
    const pts = resolvedPositions(48, 'grid', 8);
    expect(pts).toHaveLength(48);
    expect(pts.every((p) => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1)).toBe(true);
  });

  it('resolvedPositions distribution returns count points (triangular)', () => {
    expect(resolvedPositions(45, 'distribution')).toHaveLength(45);
  });

  it('lerpPositions at t=0 equals from, at t=1 equals to', () => {
    const from = scatterPositions(10, 3);
    const to = resolvedPositions(10, 'grid', 5);
    expect(lerpPositions(from, to, 0)).toEqual(from);
    expect(lerpPositions(from, to, 1)).toEqual(to);
  });

  it('markTone maps progress to mark ramp tokens', () => {
    expect(markTone(0)).toContain('--mark-faded');
    expect(markTone(1)).toContain('--mark-resolved');
  });
});
