import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ScenePalette } from "../palettes";
import { scrollProgress } from "../scrollProgress";
import { makeCircleTexture } from "./textures";
import { hash } from "./motion";

const IS_NARROW = typeof window !== "undefined" && window.innerWidth < 768;
const DEFAULT_COUNT = IS_NARROW ? 320 : 760;

/**
 * The "inside the prism" reveal. A dense swarm packed near the origin, invisible
 * at the hero and faded in only as the camera dives through the prism — so
 * zooming in uncovers a whole new field of particles instead of the prism
 * shrinking away. Fades back out once the camera has passed, keeping content
 * sections calm and readable. Additive on dark, normal on light (per palette).
 */
export function InnerParticles({ pal, count = DEFAULT_COUNT }: { pal: ScenePalette; count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const sprite = useMemo(() => makeCircleTexture(), []);
  const N = count;

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const cA = new THREE.Color(pal.particleA);
    const cB = new THREE.Color(pal.particleB);
    for (let i = 0; i < N; i++) {
      // Tight shell around the origin so the camera flies through the middle.
      const r = 0.4 + hash(i * 3.7) * 3.4;
      const th = hash(i * 1.3) * Math.PI * 2;
      const ph = Math.acos(2 * hash(i * 2.9) - 1);
      positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
      positions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      positions[i * 3 + 2] = r * Math.cos(ph);
      const c = cA.clone().lerp(cB, hash(i * 4.1));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [N, pal]);

  useFrame((_, d) => {
    const pts = ref.current;
    const mat = matRef.current;
    if (pts) pts.rotation.y += d * 0.06;
    if (mat && pts) {
      const p = scrollProgress.current;
      // Hidden at the hero → revealed through the dive → gone before content.
      // Raised-cosine (Hann) bell over p[0,0.31]: zero value AND zero slope at
      // both ends, single smooth peak at the pass-through (~p=0.155) — so the
      // swarm eases in and out instead of popping on/off.
      const t = Math.min(1, Math.max(0, p / 0.31));
      const reveal = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
      mat.opacity = pal.particleOpacity * 1.1 * reveal;
      pts.visible = reveal > 0.002;
    }
  });

  return (
    <points ref={ref} frustumCulled={false} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={pal.particleSize * (IS_NARROW ? 1.1 : 0.85)}
        map={sprite}
        alphaMap={sprite}
        vertexColors
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={pal.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}
