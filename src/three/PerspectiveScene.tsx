import { Component, Suspense, memo, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { Group } from "three";
import { useTheme } from "@/context/ThemeContext";
import { useSceneEnabled } from "./useSceneEnabled";
import { useBindScrollProgress } from "./scrollProgress";
import { PALETTES } from "./palettes";
import { usePointer } from "./pointer";
import { SceneEnvironment } from "./scene/SceneEnvironment";
import { Backdrop } from "./scene/Backdrop";
import { ParticleField } from "./scene/ParticleField";
import { InnerParticles } from "./scene/InnerParticles";
import { ScrollCamera } from "./scene/ScrollCamera";
import { GlassPrism } from "./scene/GlassPrism";
import { SecondaryGeodesic } from "./scene/SecondaryGeodesic";
import { HeroPoster } from "./HeroPoster";

/**
 * Any WebGL/Canvas render error falls back to the static poster. `resetKey`
 * (the active theme) clears a latched failure so a scene that tripped on one
 * palette can recover on the next theme change.
 */
class SceneErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode; resetKey: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * The persistent landing background: one lazy full-page canvas fixed behind the
 * DOM. Gated → poster on incapable clients. Default export so it can be
 * React.lazy'd off the initial bundle.
 */
export default function PerspectiveScene() {
  const enabled = useSceneEnabled();
  const { resolvedTheme } = useTheme();
  if (!enabled) return <HeroPoster />;
  return (
    <SceneErrorBoundary fallback={<HeroPoster />} resetKey={resolvedTheme}>
      <ThemedScene theme={resolvedTheme} />
    </SceneErrorBoundary>
  );
}

const FADE_MS = 700;

/**
 * Smooth theme switch on a SINGLE, never-remounted canvas. We do NOT key the
 * Canvas by theme: remounting it tears down the WebGL context AND makes
 * @react-three/postprocessing's EffectComposer throw (it JSON.stringifies its
 * child tree, which is circular). Instead the palette updates live — every
 * material re-reads `pal` — and only drei's <Environment> is re-keyed (its light
 * map is baked once at mount, so it needs a fresh mount to re-bake).
 *
 * To hide the instant palette pop + the Environment re-bake flash, we freeze the
 * current frame to an <img> overlay and dissolve it out over the swap (needs
 * `preserveDrawingBuffer` on the canvas). If the snapshot can't be captured the
 * swap just happens live under a brief fade — still no remount, no composer error.
 */
function ThemedScene({ theme }: { theme: "light" | "dark" }) {
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [snapOpacity, setSnapOpacity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef(true);

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return; // no crossfade on initial mount
    }
    let url: string | null = null;
    try {
      url = containerRef.current?.querySelector("canvas")?.toDataURL("image/png") ?? null;
    } catch {
      url = null; // tainted/lost context — fall back to a plain fade
    }
    setSnapshot(url);
    setSnapOpacity(1);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setSnapOpacity(0)));
    const done = window.setTimeout(() => setSnapshot(null), FADE_MS + 80);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(done);
    };
  }, [theme]);

  return (
    <div ref={containerRef}>
      <SceneCanvas theme={theme} />
      {snapshot && (
        <img
          src={snapshot}
          aria-hidden
          alt=""
          className="pointer-events-none fixed inset-0 h-full w-full object-cover"
          style={{ opacity: snapOpacity, transition: `opacity ${FADE_MS}ms ease` }}
        />
      )}
    </div>
  );
}

function SceneCanvas({ theme }: { theme: "light" | "dark" }) {
  useBindScrollProgress();
  const pal = PALETTES[theme];
  const pointer = usePointer();
  const rigRef = useRef<Group>(null);
  const bloomRef = useRef<{ intensity: number } | null>(null);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ background: "hsl(var(--background))" }}
    >
      <Canvas
        camera={{ position: [0, 0, 6.4], fov: 50 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <fog attach="fog" args={[pal.fogColor, pal.fog[0], pal.fog[1]]} />
        <ScrollCamera pointer={pointer} rigRef={rigRef} bloomRef={bloomRef} baseBloom={pal.bloom} />
        <Suspense fallback={null}>
          {/* Re-key so the once-baked (frames={1}) light map re-bakes per theme. */}
          <SceneEnvironment key={theme} pal={pal} />
          <Backdrop pal={pal} />
          <group ref={rigRef}>
            <ParticleField pal={pal} />
            <InnerParticles pal={pal} />
            <SecondaryGeodesic pal={pal} />
            <GlassPrism pal={pal} />
          </group>
        </Suspense>
        <Effects bloomRef={bloomRef} />
      </Canvas>
    </div>
  );
}

/**
 * The postprocessing stack, isolated behind `memo` with only the stable
 * `bloomRef` as a prop, so it NEVER re-renders on a theme change. That matters
 * because React 19 passes `ref` as a prop and @react-three/postprocessing's
 * effect wrapper does `JSON.stringify(props)` — once `bloomRef.current` is a live
 * BloomEffect (circular three refs), any re-render throws "Converting circular
 * structure to JSON" and trips the error boundary. A constant base intensity is
 * fine: ScrollCamera writes `bloomRef.current.intensity` every frame from the
 * active palette's bloom, so the per-theme value is applied live via the ref.
 */
const Effects = memo(function Effects({ bloomRef }: { bloomRef: RefObject<{ intensity: number } | null> }) {
  return (
    <EffectComposer>
      <Bloom ref={bloomRef} intensity={0.4} luminanceThreshold={0.45} luminanceSmoothing={0.9} mipmapBlur />
    </EffectComposer>
  );
});
