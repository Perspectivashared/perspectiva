import * as THREE from "three";

/** Materialise a hex ramp into reusable THREE.Color stops (call in useMemo). */
export function toColors(hexes: readonly string[]): THREE.Color[] {
  return hexes.map((h) => new THREE.Color(h));
}

/**
 * Sample a multi-stop colour ramp at t∈[0,1] into `out` (no allocation). Turns a
 * flat two-colour lerp into a full prism spectrum: blue→cyan→pale→violet, which
 * reads as light dispersed through the hero prism.
 */
export function sampleRamp(stops: THREE.Color[], t: number, out: THREE.Color): THREE.Color {
  if (stops.length === 1) return out.copy(stops[0]);
  const clamped = Math.min(1, Math.max(0, t));
  const seg = clamped * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(seg));
  return out.copy(stops[i]).lerp(stops[i + 1], seg - i);
}
