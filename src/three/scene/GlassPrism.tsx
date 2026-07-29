import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Edges } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh } from "three";
import type { ScenePalette } from "../palettes";
import { scrollProgress } from "../scrollProgress";
import { hash, smoothstep } from "./motion";

const IS_NARROW = typeof window !== "undefined" && window.innerWidth < 768;
const PRISM_RADIUS = 2.6;
const SHARD_DIVISIONS = IS_NARROW ? 2 : 3; // 4·d² fragments (16 / 36)

// Scroll windows (in scrollProgress terms — normalized page progress). The
// break is timed EARLY, while the prism is still centre-stage and unoccluded:
// past ~p=0.10 the DOM content cards rise over the canvas centre, so a later
// shatter would burst behind them. At SHATTER_START the fragments still
// reassemble the prism exactly; across [SHATTER_START, SHATTER_END] they fly
// outward from their own positions and tumble — a true fracture, not a cloud of
// mini-prisms. All a pure function of scroll → scrubbing up reassembles it.
const SOLID_FADE_IN = 0.05;
const SOLID_FADE_OUT = 0.075; // snap the solid off as the crack forms
const SHATTER_START = 0.05;
const SHATTER_END = 0.18;
// Fraction of the shatter window (in normalized s) spent CRACKING before the
// explosion: seams open across the still-whole prism, then it detonates.
const CRACK_FRAC = 0.3;

/**
 * Hero centerpiece — a tetrahedral glass prism. Core meshPhysicalMaterial (NOT
 * drei MeshTransmissionMaterial, which would sample the particles). The
 * per-theme axis is the LOCKED look: DARK = frosted (rough 0.24, subtle
 * dispersion), LIGHT = clear crystal (rough 0.05, vivid edge CA). Reads
 * transparent because the opaque Backdrop sits behind it.
 *
 * On the dive the solid prism hands off to `PrismShards`, which fracture the
 * same tetrahedron into triangular pieces that break apart and fly past — a
 * breaking-glass transition into the inner particle field.
 */
export function GlassPrism({ pal }: { pal: ScenePalette }) {
  const spin = useRef<Mesh>(null);
  useFrame((_, d) => {
    const m = spin.current;
    if (!m) return;
    m.rotation.y += d * 0.22;
    m.rotation.x += d * 0.08;
    // Hold full size, then dissolve fast right as the shatter begins so the
    // fragments take over the glass presence as it cracks.
    const o = 1 - smoothstep(SOLID_FADE_IN, SOLID_FADE_OUT, scrollProgress.current);
    const transparent = o < 0.999;
    m.visible = o > 0.01;
    m.traverse((child) => {
      const mat = (child as Mesh).material as
        | { transparent: boolean; opacity: number }
        | undefined;
      if (mat) {
        mat.transparent = transparent;
        mat.opacity = o;
      }
    });
  });
  return (
    <group>
      <Float speed={0.7} rotationIntensity={0.28} floatIntensity={0.5}>
        <mesh ref={spin}>
          <tetrahedronGeometry args={[PRISM_RADIUS, 0]} />
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
      <PrismShards pal={pal} />
    </group>
  );
}

/**
 * Fracture the tetrahedron into triangular fragments and animate them entirely
 * on the GPU (one draw call). Each fragment's vertices are stored relative to
 * its own centroid, so the vertex shader rotates each piece about its centre and
 * throws that centre radially outward by a scroll-driven amount: at s=0 the
 * pieces sit exactly where the solid tetra's faces are (it looks whole), then
 * they separate and tumble. A fresnel term fakes glassy edge-lit shards without
 * the cost of transmission.
 */
function PrismShards({ pal }: { pal: ScenePalette }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => buildFractureGeometry(PRISM_RADIUS, SHARD_DIVISIONS), []);

  const uniforms = useMemo(
    () => ({
      uS: { value: 0 },
      uOpacity: { value: 0 },
      uCrackGlow: { value: 0 },
      uBody: { value: new THREE.Color(pal.geodesic) },
      uGlint: { value: new THREE.Color(pal.edge) },
    }),
    [pal],
  );

  useFrame(() => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;
    const s = smoothstep(SHATTER_START, SHATTER_END, scrollProgress.current);
    mesh.visible = s > 0.001 && s < 0.999;
    if (!mesh.visible) return;
    mat.uniforms.uS.value = s;
    // Pieces are near-solid the instant the glass breaks (barely any fade-in),
    // hold through the flight, then fade only as they've left the frame — so it
    // reads as opaque chunks exploding outward, not a cloud fading in.
    mat.uniforms.uOpacity.value = 0.95 * smoothstep(0, 0.015, s) * (1 - smoothstep(0.7, 1, s));
    // Seams glow brightest while cracking, easing off once the pieces fly apart.
    mat.uniforms.uCrackGlow.value =
      smoothstep(0, CRACK_FRAC, s) * (1 - smoothstep(CRACK_FRAC, CRACK_FRAC + 0.2, s));
  });

  return (
    <mesh ref={meshRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={SHARD_VERT}
        fragmentShader={SHARD_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={pal.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </mesh>
  );
}

const SHARD_VERT = /* glsl */ `
  attribute vec3 aCentroid;
  attribute vec3 aAxis;
  attribute float aSpread;
  attribute float aTurns;
  uniform float uS;
  varying float vFres;

  const float CRACK_FRAC = 0.3;
  const float GAP = 0.16; // how far seams open during the crack phase

  // Rodrigues rotation of v about unit axis a by angle.
  vec3 rot(vec3 v, vec3 a, float ang) {
    float c = cos(ang), s = sin(ang);
    return v * c + cross(a, v) * s + a * dot(a, v) * (1.0 - c);
  }

  void main() {
    // Two-stage break: cracks open first (pieces inch apart, no spin), then the
    // explosion throws them out with high initial velocity and full tumble.
    float sc = smoothstep(0.0, CRACK_FRAC, uS);      // 0..1 crack separation
    float se = smoothstep(CRACK_FRAC, 1.0, uS);      // 0..1 explosion progress
    float ee = 1.0 - pow(1.0 - se, 3.0);             // cubic ease-out throw
    float ang = aTurns * se;                         // spin only once it detonates
    vec3 rp = rot(position, aAxis, ang);             // spin about own centroid
    vec3 dir = normalize(aCentroid);
    vec3 c = aCentroid + dir * (sc * GAP + ee * aSpread);
    vec4 mv = modelViewMatrix * vec4(c + rp, 1.0);
    vec3 n = normalize(normalMatrix * rot(normal, aAxis, ang));
    vec3 vd = normalize(-mv.xyz);
    vFres = pow(1.0 - abs(dot(n, vd)), 2.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const SHARD_FRAG = /* glsl */ `
  uniform float uOpacity;
  uniform float uCrackGlow;
  uniform vec3 uBody;
  uniform vec3 uGlint;
  varying float vFres;
  void main() {
    // Brighten toward the glint during the crack so the opening seams glow.
    float edge = clamp(vFres + uCrackGlow * 0.5, 0.0, 1.0);
    vec3 col = mix(uBody, uGlint, edge);
    float a = uOpacity * (0.6 + 0.4 * vFres + uCrackGlow * 0.2); // solid chunks, glowing seams
    if (a < 0.01) discard;
    gl_FragColor = vec4(col, a);
  }
`;

/**
 * Build a tetrahedron subdivided into `4·divisions²` triangular fragments.
 * Positions are stored RELATIVE to each fragment's centroid (so the shader can
 * spin each piece in place); `aCentroid` carries the world offset, and per-piece
 * `aAxis` / `aSpread` / `aTurns` seed the burst. Non-indexed (flat facets).
 */
function buildFractureGeometry(radius: number, divisions: number): THREE.BufferGeometry {
  const base = [
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(1, -1, -1),
    new THREE.Vector3(-1, 1, -1),
    new THREE.Vector3(-1, -1, 1),
  ].map((v) => v.normalize().multiplyScalar(radius));
  const faces = [
    [0, 1, 2],
    [0, 3, 1],
    [0, 2, 3],
    [1, 3, 2],
  ];

  const position: number[] = [];
  const normal: number[] = [];
  const centroid: number[] = [];
  const axis: number[] = [];
  const spread: number[] = [];
  const turns: number[] = [];
  let idx = 0;

  const pushTri = (P0: THREE.Vector3, P1: THREE.Vector3, P2: THREE.Vector3) => {
    const cen = new THREE.Vector3().add(P0).add(P1).add(P2).multiplyScalar(1 / 3);
    const nrm = new THREE.Vector3()
      .subVectors(P1, P0)
      .cross(new THREE.Vector3().subVectors(P2, P0))
      .normalize();
    if (nrm.dot(cen) < 0) nrm.negate(); // outward-facing
    const ax = new THREE.Vector3(
      hash(idx * 3.1) - 0.5,
      hash(idx * 4.3) - 0.5,
      hash(idx * 5.9) - 0.5,
    ).normalize();
    const sp = 8 + hash(idx * 7.7) * 14; // throw far enough to clear the frame
    const tn = (hash(idx * 8.9) * 2 - 1) * (5 + hash(idx * 9.3) * 8); // fast signed spin
    for (const P of [P0, P1, P2]) {
      position.push(P.x - cen.x, P.y - cen.y, P.z - cen.z);
      normal.push(nrm.x, nrm.y, nrm.z);
      centroid.push(cen.x, cen.y, cen.z);
      axis.push(ax.x, ax.y, ax.z);
      spread.push(sp);
      turns.push(tn);
    }
    idx++;
  };

  for (const [a, b, c] of faces) {
    const A = base[a];
    const B = base[b];
    const C = base[c];
    const at = (i: number, j: number) => {
      const u = i / divisions;
      const v = j / divisions;
      const w = 1 - u - v;
      return new THREE.Vector3()
        .addScaledVector(A, w)
        .addScaledVector(B, u)
        .addScaledVector(C, v);
    };
    for (let i = 0; i < divisions; i++) {
      for (let j = 0; j < divisions - i; j++) {
        pushTri(at(i, j), at(i + 1, j), at(i, j + 1));
        if (j < divisions - i - 1) pushTri(at(i + 1, j), at(i + 1, j + 1), at(i, j + 1));
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(position, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normal, 3));
  geo.setAttribute("aCentroid", new THREE.Float32BufferAttribute(centroid, 3));
  geo.setAttribute("aAxis", new THREE.Float32BufferAttribute(axis, 3));
  geo.setAttribute("aSpread", new THREE.Float32BufferAttribute(spread, 1));
  geo.setAttribute("aTurns", new THREE.Float32BufferAttribute(turns, 1));
  return geo;
}
