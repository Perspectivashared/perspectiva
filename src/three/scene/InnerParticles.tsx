import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { ScenePalette } from "../palettes";
import { scrollProgress } from "../scrollProgress";
import { makeCircleTexture } from "./textures";
import { hash } from "./motion";

const IS_NARROW = typeof window !== "undefined" && window.innerWidth < 768;
const DEFAULT_COUNT = IS_NARROW ? 320 : 760;

// Per-particle staggered reveal. A global `uLevel` rises 0→~1.15→0 across the
// dive; each particle carries its own threshold `aThr`, and only lights up once
// the level climbs past it (soft edge `uSoft`). Low-threshold particles appear
// first / leave last, high-threshold ones appear last / leave first — so the
// swarm grows and shrinks in COUNT gradually, instead of every particle fading
// together. Size also ramps with the per-particle reveal so they grow in, too.
const VERT = /* glsl */ `
  attribute float aThr;
  attribute vec3 aColor;
  uniform float uLevel;
  uniform float uSoft;
  uniform float uSize;
  uniform float uScale;
  varying vec3 vColor;
  varying float vA;
  void main() {
    vColor = aColor;
    float a = smoothstep(aThr, aThr + uSoft, uLevel);
    vA = a;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (0.3 + 0.7 * a) * (uScale / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vA;
  void main() {
    if (vA <= 0.001) discard;
    vec4 tex = texture2D(uMap, gl_PointCoord);
    float alpha = tex.a * vA * uOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

/**
 * The "inside the prism" reveal. A dense swarm packed near the origin, hidden at
 * the hero and staggered in/out as the camera dives through the prism — so
 * zooming in uncovers a whole new field of particles that populate and thin out
 * one-by-one, not all at once. Additive on dark, normal on light (per palette).
 */
export function InnerParticles({ pal, count = DEFAULT_COUNT }: { pal: ScenePalette; count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const gl = useThree((s) => s.gl);
  const sprite = useMemo(() => makeCircleTexture(), []);
  const N = count;

  const { positions, colors, thresholds } = useMemo(() => {
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const thresholds = new Float32Array(N);
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
      thresholds[i] = hash(i * 5.3); // per-particle birth/death threshold 0..1
    }
    return { positions, colors, thresholds };
  }, [N, pal]);

  const uniforms = useMemo(
    () => ({
      uMap: { value: sprite },
      uLevel: { value: 0 },
      uSoft: { value: 0.14 },
      uSize: { value: pal.particleSize * (IS_NARROW ? 1.1 : 0.85) },
      uScale: { value: 400 },
      uOpacity: { value: pal.particleOpacity * 1.1 },
    }),
    [sprite, pal],
  );

  useFrame((_, d) => {
    const pts = ref.current;
    const mat = matRef.current;
    if (pts) pts.rotation.y += d * 0.06;
    if (mat) {
      // Normalized dive progress → level rises then falls (peak ~p=0.155),
      // slightly overshooting 1 so even the highest-threshold particles light up.
      const g = Math.min(1, Math.max(0, scrollProgress.current / 0.31));
      mat.uniforms.uLevel.value = Math.sin(g * Math.PI) * 1.15;
      // Match PointsMaterial's sizeAttenuation scale (0.5 * drawing-buffer height).
      mat.uniforms.uScale.value = gl.domElement.height * 0.5;
    }
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aThr" args={[thresholds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={pal.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}
