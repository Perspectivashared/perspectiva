import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ScenePalette } from "../palettes";
import { scrollProgress } from "../scrollProgress";
import { makeCircleTexture } from "./textures";
import { easeInOut, hash } from "./motion";

const IS_NARROW = typeof window !== "undefined" && window.innerWidth < 768;
const DEFAULT_COUNT = IS_NARROW ? 480 : 1000;

/**
 * Ambient / transition particle cloud. Lerps from a scattered sphere into a 3D
 * bar-chart as the page scrolls (the "anamorphic resolve" — noise → signal),
 * driven by the shared scrollProgress. Soft circular sprites (not square points),
 * additive on dark / normal on light. Mobile scales the count down.
 *
 * Transparent particles are excluded from three's transmission pass, so the
 * prism refracts light, not these particles (intended).
 */
export function ParticleField({ pal, count = DEFAULT_COUNT }: { pal: ScenePalette; count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const sprite = useMemo(() => makeCircleTexture(), []);
  const N = count;

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
    const t = easeInOut(scrollProgress.current);
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < N * 3; i++) arr[i] = scatter[i] + (target[i] - scatter[i]) * t;
    pts.geometry.attributes.position.needsUpdate = true;
    pts.rotation.y = scrollProgress.current * 0.5;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={pal.particleSize * (IS_NARROW ? 1.25 : 1)}
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
