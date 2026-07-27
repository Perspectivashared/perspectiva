import { Component, Suspense, useRef, type ReactNode } from "react";
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
import { ScrollCamera } from "./scene/ScrollCamera";
import { GlassPrism } from "./scene/GlassPrism";
import { SecondaryGeodesic } from "./scene/SecondaryGeodesic";
import { HeroPoster } from "./HeroPoster";

/** Any WebGL/Canvas render error falls back to the static poster. */
class SceneErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
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
  if (!enabled) return <HeroPoster />;
  return (
    <SceneErrorBoundary fallback={<HeroPoster />}>
      <SceneCanvas />
    </SceneErrorBoundary>
  );
}

function SceneCanvas() {
  useBindScrollProgress();
  const { resolvedTheme } = useTheme();
  const pal = PALETTES[resolvedTheme];
  const pointer = usePointer();
  const rigRef = useRef<Group>(null);
  const bloomRef = useRef<{ intensity: number } | null>(null);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ background: "hsl(var(--background))" }}
    >
      <Canvas camera={{ position: [0, 0, 6.4], fov: 50 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true }}>
        <fog attach="fog" args={[pal.fogColor, pal.fog[0], pal.fog[1]]} />
        <ScrollCamera pointer={pointer} rigRef={rigRef} bloomRef={bloomRef} baseBloom={pal.bloom} />
        <Suspense fallback={null}>
          <SceneEnvironment pal={pal} />
          <Backdrop pal={pal} />
          <group ref={rigRef}>
            <ParticleField pal={pal} />
            <SecondaryGeodesic pal={pal} />
            <GlassPrism pal={pal} />
          </group>
        </Suspense>
        <EffectComposer>
          <Bloom
            ref={bloomRef}
            intensity={pal.bloom}
            luminanceThreshold={0.45}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
