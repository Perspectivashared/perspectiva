/**
 * Per-theme palette for the landing WebGL scene.
 *
 * Scene-only: colours here feed THREE.Color / material params, so they stay as
 * hex literals. The DOM wordmark/tagline text colours are the Hero component's
 * concern (P0 CSS tokens), deliberately NOT duplicated here.
 *
 * The material axis (rough / disp / envI / glassTint* / edge / bloom / ambient)
 * are the LOCKED values validated in the HeroLab prototype — ship verbatim.
 */

export interface ScenePalette {
  /** Opaque radial backdrop gradient stops (inner→outer) — so the prism
      refracts a dark/light scene (reads transparent) not the light rig. */
  bgStops: [string, string, string];
  fogColor: string;
  fog: [number, number];
  /** Prism-dispersion spectrum (low→high): particles sample across it for a
      rich multi-hue swarm instead of a flat two-colour lerp. */
  particleRamp: string[];
  particleOpacity: number;
  particleSize: number;
  additive: boolean;
  /** Glass attenuation tint + distance (colourless on dark, faint cool on light). */
  glassTint: string;
  glassTintDist: number;
  envI: number;
  /** Prism dispersion (edge chromatic aberration). */
  disp: number;
  /** Prism roughness (frosted on dark, near-clear on light). */
  rough: number;
  edge: string;
  geodesic: string;
  geoOpacity: number;
  sparkle: string;
  sparkleOpacity: number;
  /** In-scene light rig: [color, intensity] per Lightformer (white / turquoise / purple). */
  lightformers: [string, number][];
  ambient: number;
  bloom: number;
}

export const PALETTES: Record<"light" | "dark", ScenePalette> = {
  dark: {
    bgStops: ["#1c2f58", "#0b1428", "#05080f"],
    fogColor: "#0a1122",
    fog: [11, 26],
    particleRamp: ["#4d7ce6", "#63d5e6", "#8fe6d8", "#bfe0ff", "#a98bff"],
    particleOpacity: 0.95,
    particleSize: 0.07,
    additive: true,
    glassTint: "#ffffff", // colourless
    glassTintDist: 100,
    envI: 0.6, // dim env → refracts dark scene (transparent, not white)
    disp: 3, // subtle edge fringe, not bold anaglyph bars
    rough: 0.24, // frosted / etched glass
    edge: "#e6f0ff",
    geodesic: "#3f66c2",
    geoOpacity: 0.22,
    sparkle: "#9ec8ff",
    sparkleOpacity: 0.68,
    lightformers: [
      ["#bcd8ff", 1.1],
      ["#38e0d0", 0.9],
      ["#c07bff", 0.9],
    ],
    ambient: 0.38,
    bloom: 0.42,
  },
  light: {
    bgStops: ["#ffffff", "#e5edf9", "#bcd2ec"],
    fogColor: "#e9f0fb",
    fog: [13, 32],
    // Consistent blue family (no teal/violet outliers) so the ambient field and
    // the revealed inner swarm read the same hue before/after the fracture.
    particleRamp: ["#22499f", "#2f5fc0", "#2f74d6", "#3f6fca", "#4a5fc8"],
    particleOpacity: 0.92,
    particleSize: 0.1,
    additive: false,
    glassTint: "#a9c8f0", // faint cool tint so clear glass reads on white
    glassTintDist: 2.8,
    envI: 0.9,
    disp: 14, // vivid lens CA on the light theme
    rough: 0.05, // near-clear crystal
    edge: "#22499f", // dark edges, visible on white
    geodesic: "#345fbd",
    geoOpacity: 0.5,
    sparkle: "#3f6fca",
    sparkleOpacity: 0.78,
    lightformers: [
      ["#ffffff", 1.9],
      ["#3fd0c0", 1.4],
      ["#9d6cff", 1.3],
    ],
    ambient: 0.7,
    bloom: 0.26,
  },
};
