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

/**
 * Any WebGL/Canvas render error falls back to the static poster. `resetKey`
 * (the active theme) clears the latched failure: a fresh mount on theme change
 * lets a scene that tripped on one palette recover on the next.
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
      {/* Remount the whole canvas on theme change: swapping palettes on live
          transmission materials / Environment is fragile, but each palette
          renders cleanly from a fresh mount. Toggles are rare, so the WebGL
          context teardown/recreate cost is acceptable. */}
      <SceneCanvas key={resolvedTheme} theme={resolvedTheme} />
    </SceneErrorBoundary>
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
