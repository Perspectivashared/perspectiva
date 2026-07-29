import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Edges } from "@react-three/drei";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import type { ScenePalette } from "../palettes";
import { scrollProgress } from "../scrollProgress";
import { hash, smoothstep } from "./motion";

const IS_NARROW = typeof window !== "undefined" && window.innerWidth < 768;
const PRISM_RADIUS = 2.6;
const SHARD_DIVISIONS = IS_NARROW ? 2 : 3; // 4·d² fragments (16 / 36)

// Scroll windows (in scrollProgress terms — normalized page progress). The
// break is timed EARLY, while the prism is still centre-stage and unoccluded:
// past ~p=0.13 the DOM content cards rise over the canvas centre. At crack
// start the fragments still reassemble the prism exactly (a real fracture of
// the tetra, not a cloud of mini-prisms); everything is a pure function of
// scroll → scrubbing up reassembles it.
const SOLID_FADE_IN = 0.04;
const SOLID_FADE_OUT = 0.075; // fade the smooth prism as the faceted cracks take over
// The break plays as two scroll-driven stages. Cracks animate in SLOWLY across
// a long, early window — seams propagate over the still-whole prism as you
// scroll — then a short, fast window detonates the pieces. Kept early enough
// that the crack finishes before the DOM content cards rise over the centre.
const CRACK_START = 0.04;
const CRACK_END = 0.13;
const EXPLODE_START = 0.13;
const EXPLODE_END = 0.2;

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
  const rot = useRef<Group>(null);
  const solid = useRef<Mesh>(null);
  useFrame((_, d) => {
    // Spin the SHARED group so the solid prism and its fracture fragments rotate
    // (and Float) as one — otherwise the shards, built in the base orientation,
    // wouldn't line up with the spinning prism at the moment it breaks.
    const g = rot.current;
    if (g) {
      g.rotation.y += d * 0.22;
      g.rotation.x += d * 0.08;
    }
    // Hold full size, then dissolve fast right as the shatter begins so the
    // fragments take over the glass presence as it cracks.
    const m = solid.current;
    if (m) {
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
    }
  });
  return (
    <Float speed={0.7} rotationIntensity={0.28} floatIntensity={0.5}>
      <group ref={rot}>
        <mesh ref={solid}>
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
        <PrismShards pal={pal} />
      </group>
    </Float>
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
      uCrack: { value: 0 },
      uExplode: { value: 0 },
      uOpacity: { value: 0 },
      uBody: { value: new THREE.Color(pal.geodesic) },
      uGlint: { value: new THREE.Color(pal.edge) },
    }),
    [pal],
  );

  useFrame(() => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;
    const p = scrollProgress.current;
    const crack = smoothstep(CRACK_START, CRACK_END, p);
    const explode = smoothstep(EXPLODE_START, EXPLODE_END, p);
    mesh.visible = crack > 0.001 && explode < 0.999;
    if (!mesh.visible) return;
    mat.uniforms.uCrack.value = crack;
    mat.uniforms.uExplode.value = explode;
    // Fade in as the first cracks open, hold through the flight, fade out only
    // once the pieces have left the frame — opaque chunks, not a cloud.
    mat.uniforms.uOpacity.value = 0.95 * smoothstep(0, 0.06, crack) * (1 - smoothstep(0.7, 1, explode));
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
  attribute float aCrack;   // 0..1 order this piece cracks in (spreads across the prism)
  uniform float uCrack;     // 0..1 crack-in progress
  uniform float uExplode;   // 0..1 explosion progress
  varying float vFres;
  varying float vGlow;

  const float GAP = 0.18;   // how far seams open during the crack phase
  const float BAND = 0.4;   // per-piece crack softness (overlap → smooth propagation)

  // Rodrigues rotation of v about unit axis a by angle.
  vec3 rot(vec3 v, vec3 a, float ang) {
    float c = cos(ang), s = sin(ang);
    return v * c + cross(a, v) * s + a * dot(a, v) * (1.0 - c);
  }

  void main() {
    // Progressive crack: each piece opens once the crack front (uCrack) passes
    // its own threshold, so seams spread across the prism as you scroll.
    float thr = aCrack * (1.0 - BAND);
    float crackAmt = smoothstep(thr, thr + BAND, uCrack);
    // Explosion: cubic ease-out throw (high initial velocity) + full tumble.
    float ee = 1.0 - pow(1.0 - uExplode, 3.0);
    float ang = aTurns * uExplode;                   // spin only once it detonates
    vec3 rp = rot(position, aAxis, ang);             // spin about own centroid
    vec3 dir = normalize(aCentroid);
    vec3 c = aCentroid + dir * (crackAmt * GAP + ee * aSpread);
    vec4 mv = modelViewMatrix * vec4(c + rp, 1.0);
    vec3 n = normalize(normalMatrix * rot(normal, aAxis, ang));
    vec3 vd = normalize(-mv.xyz);
    vFres = pow(1.0 - abs(dot(n, vd)), 2.0);
    // Seam glow travels with the crack front (peaks mid-open), gone once exploded.
    vGlow = crackAmt * (1.0 - crackAmt) * 4.0 * (1.0 - uExplode);
    gl_Position = projectionMatrix * mv;
  }
`;

const SHARD_FRAG = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uBody;
  uniform vec3 uGlint;
  varying float vFres;
  varying float vGlow;
  void main() {
    // Brighten toward the glint along the travelling crack front so seams glow.
    float edge = clamp(vFres + vGlow * 0.6, 0.0, 1.0);
    vec3 col = mix(uBody, uGlint, edge);
    float a = uOpacity * (0.6 + 0.4 * vFres + vGlow * 0.25); // solid chunks, glowing seams
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
  const crack: number[] = [];
  const seed = base[0]; // cracks radiate outward from this corner
  let maxCrack = 0;
  let idx = 0;

  const pushTri = (P0: THREE.Vector3, P1: THREE.Vector3, P2: THREE.Vector3) => {
    const cen = new THREE.Vector3().add(P0).add(P1).add(P2).multiplyScalar(1 / 3);
    const dc = cen.distanceTo(seed);
    if (dc > maxCrack) maxCrack = dc;
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
      crack.push(dc);
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

  const inv = maxCrack > 0 ? 1 / maxCrack : 1; // normalize crack order to 0..1
  for (let k = 0; k < crack.length; k++) crack[k] *= inv;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(position, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normal, 3));
  geo.setAttribute("aCentroid", new THREE.Float32BufferAttribute(centroid, 3));
  geo.setAttribute("aAxis", new THREE.Float32BufferAttribute(axis, 3));
  geo.setAttribute("aSpread", new THREE.Float32BufferAttribute(spread, 1));
  geo.setAttribute("aTurns", new THREE.Float32BufferAttribute(turns, 1));
  geo.setAttribute("aCrack", new THREE.Float32BufferAttribute(crack, 1));
  return geo;
}
