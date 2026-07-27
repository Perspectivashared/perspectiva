export type Point = { x: number; y: number };

/** Deterministic hash in [0,1) — no Math.random, so scatter is stable across
 *  renders/SSR and the reduced-motion static state matches the animated start. */
const hash = (i: number, seed: number): number => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function scatterPositions(count: number, seed = 1): Point[] {
  return Array.from({ length: count }, (_, i) => ({
    x: hash(i * 2 + 1, seed),
    y: hash(i * 2 + 2, seed),
  }));
}

export function resolvedPositions(
  count: number,
  shape: 'grid' | 'distribution' = 'grid',
  cols = Math.max(1, Math.round(Math.sqrt(count))),
): Point[] {
  if (shape === 'grid') {
    const rows = Math.ceil(count / cols);
    return Array.from({ length: count }, (_, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      return {
        x: cols === 1 ? 0.5 : c / (cols - 1),
        y: rows === 1 ? 0.5 : r / (rows - 1),
      };
    });
  }
  // Triangular distribution: rows of 1,2,3… marks, centered (matches v2-resolved).
  const totalRows = Math.ceil((-1 + Math.sqrt(1 + 8 * count)) / 2);
  const pts: Point[] = [];
  let row = 0;
  let placed = 0;
  while (placed < count) {
    const inRow = Math.min(row + 1, count - placed);
    for (let c = 0; c < inRow; c++) {
      pts.push({
        x: inRow === 1 ? 0.5 : 0.5 + (c - (inRow - 1) / 2) / (totalRows - 1 || 1) / 2,
        y: totalRows === 1 ? 0.5 : row / (totalRows - 1),
      });
    }
    placed += inRow;
    row++;
  }
  return pts;
}

export function lerpPositions(from: Point[], to: Point[], t: number): Point[] {
  // Exact endpoints (no float drift): t=1 must equal the resolved end-state so
  // the reduced-motion static render matches the animation's final frame.
  if (t <= 0) return from.map((p) => ({ x: p.x, y: p.y }));
  if (t >= 1) return to.map((p) => ({ x: p.x, y: p.y }));
  return from.map((p, i) => ({
    x: p.x + (to[i].x - p.x) * t,
    y: p.y + (to[i].y - p.y) * t,
  }));
}

const RAMP = ['--mark-faded', '--mark-weak', '--mark-mid', '--mark-strong', '--mark-resolved'];

/** Maps progress t∈[0,1] to a `hsl(var(--mark-*))` color across the ramp. */
export function markTone(t: number): string {
  const idx = Math.min(RAMP.length - 1, Math.max(0, Math.round(t * (RAMP.length - 1))));
  return `hsl(var(${RAMP[idx]}))`;
}
