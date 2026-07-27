/**
 * HeroLab — THROWAWAY prototype route (/dev/hero-lab, DEV-only, noindex).
 *
 * v3 "perspective" hero (centered brand composition):
 *   • Huge "Perspectiva" wordmark centered over everything, tagline underneath,
 *     on a contrast scrim so it stays AA-legible over the glass.
 *   • Tetrahedral GLASS prism (large, centered) — clear, colorless core
 *     meshPhysicalMaterial. Per-theme env: DARK dims the light-rig so the glass
 *     refracts a dark scene (reads transparent, not white); LIGHT keeps a faint
 *     cool tint + dark edges so the crystal reads on a pale ground. High
 *     dispersion → lens-style chromatic aberration on the edges.
 *   • Geodesic + particles darker/saturated on light so they clear the gradient.
 *   • Panels mode: 3D treatment preview for cards. Pointer parallax throughout.
 *
 * KNOWN: @react-three/fiber augments react's JSX.IntrinsicElements → breaks
 * `npm run typecheck` for polymorphic app components. Vite/SWC ignores types so
 * this RUNS. Isolating that is a P2a-foundation task, not solved in this lab.
 *
 * NOT production. Delete once the direction is locked and P2a foundation starts.
 */
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ScrollControls,
  useScroll,
  Sparkles,
  Float,
  Edges,
  RoundedBox,
  Environment,
  Lightformer,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

type Mode = "hero" | "panels";
type ThemeName = "dark" | "light";
type Pointer = MutableRefObject<{ x: number; y: number }>;

interface Palette {
  container: string;
  scrim: string;
  bgStops: [string, string, string];
  fogColor: string;
  fog: [number, number];
  text: string;
  textMuted: string;
  accent: string;
  eyebrow: string;
  particleA: string;
  particleB: string;
  particleOpacity: number;
  particleSize: number;
  additive: boolean;
  glassTint: string;
  glassTintDist: number;
  envI: number;
  disp: number;
  rough: number;
  panelColor: string;
  edge: string;
  geodesic: string;
  geoOpacity: number;
  sparkle: string;
  sparkleOpacity: number;
  lightformers: [string, number][];
  ambient: number;
  bloom: number;
}

const THEMES: Record<ThemeName, Palette> = {
  dark: {
    container: "radial-gradient(120% 100% at 50% 42%, #16264c 0%, #0a1122 45%, #060a15 100%)",
    scrim: "radial-gradient(ellipse 64% 62% at 50% 50%, rgba(6,10,21,0.78) 0%, rgba(6,10,21,0.46) 46%, rgba(6,10,21,0) 74%)",
    bgStops: ["#1c2f58", "#0b1428", "#05080f"],
    fogColor: "#0a1122",
    fog: [11, 26],
    text: "#eef4ff",
    textMuted: "#c6d4ee",
    accent: "#84baff",
    eyebrow: "#8ec5ff",
    particleA: "#5f92dd",
    particleB: "#aed4ff",
    particleOpacity: 0.95,
    particleSize: 0.07,
    additive: true,
    glassTint: "#ffffff", // colorless
    glassTintDist: 100,
    envI: 0.6, // dim env → refracts dark scene (transparent); enough for soft facet sheen
    disp: 3, // subtle edge chromatic fringe, not bold anaglyph RGB bars
    rough: 0.24, // frosted / etched glass — blurs the transmitted refraction
    panelColor: "#7ab8ff",
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
    container: "radial-gradient(125% 108% at 50% 26%, #ffffff 0%, #e5edf9 46%, #bfd2ec 100%)",
    scrim: "radial-gradient(ellipse 64% 62% at 50% 50%, rgba(244,248,255,0.88) 0%, rgba(244,248,255,0.46) 46%, rgba(244,248,255,0) 74%)",
    bgStops: ["#ffffff", "#e5edf9", "#bcd2ec"],
    fogColor: "#e9f0fb",
    fog: [13, 32],
    text: "#0b1830",
    textMuted: "#384965", // deep slate, high contrast on light
    accent: "#1a4fd6",
    eyebrow: "#1c47bd",
    particleA: "#3f6fca",
    particleB: "#123f9e",
    particleOpacity: 0.92,
    particleSize: 0.1,
    additive: false,
    glassTint: "#a9c8f0", // faint cool tint so the clear glass reads on white
    glassTintDist: 2.8,
    envI: 0.9,
    disp: 14,
    rough: 0.05, // near-clear crystal (light theme stays sharp)
    panelColor: "#2f6bf0",
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

const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const isNarrow = typeof window !== "undefined" && window.innerWidth < 768;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const damp = (cur: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.lerp(cur, target, 1 - Math.exp(-lambda * dt));
const hash = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

function makeCircleTexture(): THREE.Texture {
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

function makeGradientTexture([a, b, c]: [string, string, string]): THREE.Texture {
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

/* Opaque gradient backdrop so the prism refracts a dark/light scene (reads
   transparent) instead of the bright light-rig (reads white). */
function Backdrop({ pal }: { pal: Palette }) {
  const tex = useMemo(() => makeGradientTexture(pal.bgStops), [pal]);
  return (
    <mesh position={[0, 0, -9]}>
      <planeGeometry args={[90, 56]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

/* ── Ambient / transition particle cloud: scatter → 3D bar-chart ───────── */
function StreamParticles({ pal }: { pal: Palette }) {
  const scroll = useScroll();
  const ref = useRef<THREE.Points>(null);
  const sprite = useMemo(() => makeCircleTexture(), []);
  const N = isNarrow ? 480 : 1000;

  const { scatter, target, colors } = useMemo(() => {
    const scatter = new Float32Array(N * 3);
    const target = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const cols = 20;
    const rows = 12;
    const cA = new THREE.Color(pal.particleA);
    const cB = new THREE.Color(pal.particleB);
    for (let i = 0; i < N; i++) {
      const r = 5 + hash(i * 3.1) * 5;
      const th = hash(i * 1.7) * Math.PI * 2;
      const ph = Math.acos(2 * hash(i * 2.3) - 1);
      scatter[i * 3] = r * Math.sin(ph) * Math.cos(th);
      scatter[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      scatter[i * 3 + 2] = r * Math.cos(ph);
      const col = i % cols;
      const row = Math.floor(i / cols) % rows;
      const barH = 0.5 + 2.6 * Math.abs(Math.sin(col * 0.6) * Math.cos(row * 0.55));
      const fill = hash(i * 4.9);
      target[i * 3] = (col - (cols - 1) / 2) * 0.3;
      target[i * 3 + 1] = -1.8 + barH * fill;
      target[i * 3 + 2] = (row - (rows - 1) / 2) * 0.3;
      const c = cA.clone().lerp(cB, fill);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { scatter, target, colors };
  }, [N, pal]);

  const positions = useMemo(() => scatter.slice(), [scatter]);

  useFrame(() => {
    const pts = ref.current;
    if (!pts) return;
    const t = prefersReduced ? 1 : easeInOut(scroll.offset);
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < N * 3; i++) arr[i] = scatter[i] + (target[i] - scatter[i]) * t;
    pts.geometry.attributes.position.needsUpdate = true;
    if (!prefersReduced) pts.rotation.y = scroll.offset * 0.5;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={pal.particleSize * (isNarrow ? 1.25 : 1)}
        map={sprite}
        alphaMap={sprite}
        vertexColors
        transparent
        opacity={pal.particleOpacity}
        sizeAttenuation
        depthWrite={false}
        blending={pal.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

/* ── Hero centerpiece: large clear glass prism, edge chromatic aberration ─ */
function GlassPrism({ pal }: { pal: Palette }) {
  const spin = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (spin.current && !prefersReduced) {
      spin.current.rotation.y += d * 0.22;
      spin.current.rotation.x += d * 0.08;
    }
  });
  return (
    <Float speed={prefersReduced ? 0 : 0.7} rotationIntensity={0.28} floatIntensity={0.5}>
      <mesh ref={spin}>
        <tetrahedronGeometry args={[2.6, 0]} />
        {/* clear colorless glass; dim env on dark keeps it transparent (not
            white); dispersion concentrates rainbow at the edges (lens CA) */}
        <meshPhysicalMaterial
          transmission={1}
          thickness={1.1}
          roughness={pal.rough}
          ior={1.5}
          dispersion={pal.disp}
          iridescence={0}
          metalness={0}
          clearcoat={0.12}
          clearcoatRoughness={0.25}
          envMapIntensity={pal.envI}
          specularIntensity={0.5}
          color="#ffffff"
          attenuationColor={pal.glassTint}
          attenuationDistance={pal.glassTintDist}
        />
        <Edges threshold={15} color={pal.edge} />
      </mesh>
    </Float>
  );
}

/* ── Secondary accent: large geodesic behind the prism ────────────────── */
function SecondaryGeodesic({ pal }: { pal: Palette }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (ref.current && !prefersReduced) ref.current.rotation.y += d * 0.045;
  });
  return (
    <group ref={ref} position={[0, 0, -1.6]} scale={4.4}>
      <mesh>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial wireframe color={pal.geodesic} transparent opacity={pal.geoOpacity} />
      </mesh>
    </group>
  );
}

/* ── Panels mode: 3D treatment preview for rectangular components ──────── */
function Panels({ pal }: { pal: Palette }) {
  return (
    <group>
      {[0, 1, 2, 3, 4].map((i) => (
        <Float key={i} speed={prefersReduced ? 0 : 1} rotationIntensity={0.3} floatIntensity={0.5}>
          <RoundedBox
            args={[2.4, 1.5, 0.06]}
            radius={0.09}
            smoothness={4}
            position={[(i - 2) * 0.35, i % 2 ? 0.35 : -0.35, -i * 0.9 + 1.2]}
            rotation={[0.08, (i - 2) * 0.22, 0]}
          >
            <meshPhysicalMaterial
              color={pal.panelColor}
              transparent
              opacity={0.18}
              roughness={0.08}
              metalness={0}
              emissive={pal.panelColor}
              emissiveIntensity={0.22}
            />
            <Edges threshold={15} color={pal.edge} />
          </RoundedBox>
        </Float>
      ))}
    </group>
  );
}

/* ── Scene: env + lights + centered camera rig + pointer parallax ─────── */
function Scene({ mode, pal, pointer }: { mode: Mode; pal: Palette; pointer: Pointer }) {
  const scroll = useScroll();
  const rig = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame((_, dt) => {
    const t = prefersReduced ? 0 : scroll.offset;
    const px = prefersReduced ? 0 : pointer.current.x;
    const py = prefersReduced ? 0 : pointer.current.y;
    const baseZ = 6.4 - t * 1.2;
    camera.position.x = damp(camera.position.x, px * 0.6, 4, dt);
    camera.position.y = damp(camera.position.y, -py * 0.5, 4, dt);
    camera.position.z = damp(camera.position.z, baseZ, 4, dt);
    camera.lookAt(0, 0, 0);
    if (rig.current && !prefersReduced) {
      rig.current.rotation.y = damp(rig.current.rotation.y, t * Math.PI * 0.6 + px * 0.3, 5, dt);
      rig.current.rotation.x = damp(rig.current.rotation.x, py * 0.2, 5, dt);
    }
  });

  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer position={[0, 3, 2]} scale={6} intensity={pal.lightformers[0][1]} color={pal.lightformers[0][0]} form="rect" />
        <Lightformer position={[-5, -1, 1]} scale={4} intensity={pal.lightformers[1][1]} color={pal.lightformers[1][0]} form="rect" />
        <Lightformer position={[5, 1, -2]} scale={4} intensity={pal.lightformers[2][1]} color={pal.lightformers[2][0]} form="circle" />
      </Environment>
      <Backdrop pal={pal} />
      <ambientLight intensity={pal.ambient} />
      <directionalLight position={[5, 6, 5]} intensity={1.5} />

      <Sparkles
        count={isNarrow ? 55 : 120}
        scale={[15, 10, 10]}
        size={2.4}
        speed={prefersReduced ? 0 : 0.35}
        opacity={pal.sparkleOpacity}
        color={pal.sparkle}
      />

      <group ref={rig}>
        <StreamParticles pal={pal} />
        {mode === "hero" ? (
          <>
            <SecondaryGeodesic pal={pal} />
            <GlassPrism pal={pal} />
          </>
        ) : (
          <Panels pal={pal} />
        )}
      </group>
    </>
  );
}

/* ── Centered wordmark overlay (DOM, over the canvas) ─────────────────── */
function Wordmark({ pal, pointer }: { pal: Palette; pointer: Pointer }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReduced) return;
    let raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el) el.style.transform = `translate3d(${pointer.current.x * -14}px, ${pointer.current.y * -10}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pointer]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
        textAlign: "center",
        padding: "0 5vw",
      }}
    >
      <div ref={ref} style={{ willChange: "transform", background: pal.scrim, padding: "12vh 10vw", borderRadius: "9999px" }}>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
            fontSize: "clamp(10px, 1.2vw, 13px)",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: pal.eyebrow,
            marginBottom: "1.4rem",
          }}
        >
          ● Gamified research platform
        </div>
        <h1
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "clamp(3.5rem, 13vw, 12rem)",
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            margin: 0,
            fontWeight: 600,
            color: pal.text,
            textShadow: pal.additive ? "0 4px 60px rgba(0,0,0,0.55)" : "0 4px 40px rgba(90,120,180,0.28)",
          }}
        >
          Perspectiva
        </h1>
        <p
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "clamp(1.1rem, 2.6vw, 1.9rem)",
            letterSpacing: "-0.01em",
            margin: "1.2rem 0 0",
            color: pal.text,
            fontWeight: 500,
          }}
        >
          Many perspectives. <span style={{ color: pal.accent }}>One clear picture.</span>
        </p>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function HeroLab() {
  const [mode, setMode] = useState<Mode>("hero");
  const [theme, setTheme] = useState<ThemeName>("dark");
  const pal = THEMES[theme];
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const chip = (active: boolean): CSSProperties => ({
    font: "inherit",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.04em",
    cursor: "pointer",
    padding: "8px 13px",
    borderRadius: 8,
    border: "1px solid",
    borderColor: active ? pal.accent : "transparent",
    background: active ? "rgba(120,170,255,0.18)" : "transparent",
    color: active ? pal.text : pal.textMuted,
  });
  const bar: CSSProperties = {
    position: "fixed",
    top: 16,
    right: 16,
    zIndex: 50,
    display: "flex",
    gap: 6,
    padding: 6,
    borderRadius: 12,
    background: theme === "dark" ? "rgba(12,18,32,0.55)" : "rgba(255,255,255,0.7)",
    backdropFilter: "blur(12px)",
    border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: pal.container }}>
      <div style={bar}>
        {(["hero", "panels"] as Mode[]).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} style={chip(mode === m)}>
            {m === "hero" ? "Hero (glass prism)" : "Panels (components)"}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setTheme((v) => (v === "dark" ? "light" : "dark"))}
          style={chip(false)}
        >
          {theme === "dark" ? "☾ Dark" : "☀ Light"}
        </button>
      </div>

      <div
        style={{
          position: "fixed",
          top: 18,
          left: 20,
          zIndex: 50,
          fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: pal.textMuted,
        }}
      >
        Hero Lab · prototype · scroll ↓ · move mouse
      </div>

      {mode === "hero" && <Wordmark pal={pal} pointer={pointer} />}

      <Canvas
        camera={{ position: [0, 0, 6.4], fov: 50 }}
        dpr={[1, isNarrow ? 1.5 : 1.8]}
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={[pal.fogColor, pal.fog[0], pal.fog[1]]} />
        <Suspense fallback={null}>
          <ScrollControls pages={2} damping={0.25}>
            <Scene mode={mode} pal={pal} pointer={pointer} />
          </ScrollControls>
        </Suspense>
        <EffectComposer>
          <Bloom intensity={pal.bloom} luminanceThreshold={0.45} luminanceSmoothing={0.9} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
