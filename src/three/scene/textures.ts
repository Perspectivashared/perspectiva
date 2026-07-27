import * as THREE from "three";

/** Soft radial-gradient sprite so particles render as glowing dots, not the
 *  default hard squares. Used as both `map` and `alphaMap` on pointsMaterial. */
export function makeCircleTexture(): THREE.Texture {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.85)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/** Opaque radial gradient for the backdrop plane so the prism refracts a
 *  dark/light scene (reads transparent) rather than the bright light rig. */
export function makeGradientTexture([a, b, c]: [string, string, string]): THREE.Texture {
  const s = 512;
  const cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(s * 0.5, s * 0.36, 0, s * 0.5, s * 0.36, s * 0.82);
  g.addColorStop(0, a);
  g.addColorStop(0.5, b);
  g.addColorStop(1, c);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(cv);
  tex.needsUpdate = true;
  return tex;
}
