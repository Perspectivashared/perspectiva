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
 *  dark/light scene (reads transparent) rather than the bright light rig.
 *  High-res with extra colour stops + per-pixel dithering so the very dark
 *  blue→black falloff doesn't show 8-bit banding (a visible "hard line"). */
export function makeGradientTexture([a, b, c]: [string, string, string]): THREE.Texture {
  const s = 1024;
  const cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(s * 0.5, s * 0.36, 0, s * 0.5, s * 0.36, s * 0.82);
  const mid = mixHex(b, c, 0.5);
  // Extra intermediate stops → gentler falloff, less stepping to begin with.
  g.addColorStop(0, a);
  g.addColorStop(0.32, b);
  g.addColorStop(0.62, mid);
  g.addColorStop(1, c);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  // Dither: nudge each pixel ±1–2 levels so adjacent bands blend instead of
  // snapping — kills the banded "line" in near-black gradients.
  const img = ctx.getImageData(0, 0, s, s);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() * 5 - 2) | 0;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.needsUpdate = true;
  return tex;
}

/** Linear-mix two #rrggbb hex colours; used for extra gradient stops. */
function mixHex(x: string, y: string, t: number): string {
  const px = parseInt(x.slice(1), 16);
  const py = parseInt(y.slice(1), 16);
  const r = Math.round((((px >> 16) & 255) * (1 - t) + ((py >> 16) & 255) * t));
  const g = Math.round((((px >> 8) & 255) * (1 - t) + ((py >> 8) & 255) * t));
  const b = Math.round(((px & 255) * (1 - t) + (py & 255) * t));
  return `rgb(${r},${g},${b})`;
}
