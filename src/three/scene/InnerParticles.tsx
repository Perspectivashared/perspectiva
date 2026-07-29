import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { ScenePalette } from "../palettes";
import { scrollProgress } from "../scrollProgress";
import { makeCircleTexture } from "./textures";
import { hash } from "./motion";
import { sampleRamp, toColors } from "./colors";

const IS_NARROW = typeof window !== "undefined" && window.innerWidth < 768;
const DEFAULT_COUNT = IS_NARROW ? 320 : 760;

// Per-particle staggered reveal, keyed directly to scroll POSITION. Each
// particle carries its own appear point `aAppear` and disappear point `aOut`
// (spread across the dive window), so as `uP` (raw scroll progress) sweeps
// down the page, particles switch on one-by-one across p[0.02,0.26] and switch
// off one-by-one across p[0.30,0.56] — the COUNT scrubs with the scrollbar
// rather than every particle fading in lockstep. Size ramps with the reveal so
// they grow in, too. Scrolling back up reverses it exactly (no time component).
const VERT = /* glsl */ `
  attribute float aAppear;
  attribute float aOut;
  attribute vec3 aColor;
  attribute float aTwinkle;
  uniform float uP;
  uniform float uTime;
  uniform float uSize;
  uniform float uScale;
  varying vec3 vColor;
  varying float vA;

  const float APPEAR_START = 0.02;
  const float APPEAR_END   = 0.26;
  const float OUT_START     = 0.30;
  const float OUT_END       = 0.56;
  const float SOFT          = 0.035;

  void main() {
    // Gentle per-particle shimmer (brightness + a touch of size) so the swarm
    // breathes; phase is per-particle so they don't pulse in lockstep.
    float tw = sin(uTime * 1.4 + aTwinkle * 6.2831853);
    vColor = aColor * (0.86 + 0.14 * tw);
    float pin  = mix(APPEAR_START, APPEAR_END, aAppear);
    float pout = mix(OUT_START, OUT_END, aOut);
    float a = smoothstep(pin, pin + SOFT, uP) * (1.0 - smoothstep(pout, pout + SOFT, uP));
    vA = a;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (0.3 + 0.7 * a) * (1.0 + 0.08 * tw) * (uScale / -mv.z);
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

  const { positions, colors, appear, out, twinkle } = useMemo(() => {
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const appear = new Float32Array(N);
    const out = new Float32Array(N);
    const twinkle = new Float32Array(N);
    const ramp = toColors(pal.particleRamp);
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      // Tight shell around the origin so the camera flies through the middle.
      const r = 0.4 + hash(i * 3.7) * 3.4;
      const th = hash(i * 1.3) * Math.PI * 2;
      const ph = Math.acos(2 * hash(i * 2.9) - 1);
      positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
      positions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      positions[i * 3 + 2] = r * Math.cos(ph);
      // Radius-graded spectrum (outer shell cooler/violet, core warmer) with a
      // little jitter, then a per-particle brightness spread for depth.
      const t = ((r - 0.4) / 3.4) * 0.7 + hash(i * 4.1) * 0.3;
      sampleRamp(ramp, t, c).multiplyScalar(0.7 + hash(i * 8.3) * 0.55);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      appear[i] = hash(i * 5.3); // scroll fraction (0..1) at which this one lights up
      out[i] = hash(i * 6.7); //    scroll fraction (0..1) at which it winks out
      twinkle[i] = hash(i * 7.9); // shimmer phase
    }
    return { positions, colors, appear, out, twinkle };
  }, [N, pal]);

  const uniforms = useMemo(
    () => ({
      uMap: { value: sprite },
      uP: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: pal.particleSize * (IS_NARROW ? 1.1 : 0.85) },
      uScale: { value: 400 },
      uOpacity: { value: pal.particleOpacity * 0.6 },
    }),
    [sprite, pal],
  );

  useFrame((state, d) => {
    const pts = ref.current;
    const mat = matRef.current;
    if (pts) pts.rotation.y += d * 0.06;
    if (mat) {
      // Drive the whole reveal straight off scroll position — no easing, so
      // scrubbing the scrollbar scrubs which particles are lit.
      mat.uniforms.uP.value = scrollProgress.current;
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      // Match PointsMaterial's sizeAttenuation scale (0.5 * drawing-buffer height).
      mat.uniforms.uScale.value = gl.domElement.height * 0.5;
    }
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aAppear" args={[appear, 1]} />
        <bufferAttribute attach="attributes-aOut" args={[out, 1]} />
        <bufferAttribute attach="attributes-aTwinkle" args={[twinkle, 1]} />
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
