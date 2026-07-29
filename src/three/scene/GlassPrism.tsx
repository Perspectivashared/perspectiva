import { useCallback, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import type { ScenePalette } from "../palettes";
import { scrollProgress } from "../scrollProgress";
import { hash, smoothstep } from "./motion";

const IS_NARROW = typeof window !== "undefined" && window.innerWidth < 768;
const PRISM_RADIUS = 2.6;
const SHARD_DIVISIONS = IS_NARROW ? 2 : 3; // 4·d² fragments (16 / 36)

// Scroll windows (normalized page progress). Timed early, while the prism is
// centre-stage: cracks spread across [CRACK_START, CRACK_END], then the pieces
// detonate across [EXPLODE_START, EXPLODE_END]. All a pure function of scroll →
// scrubbing up reassembles the prism exactly.
const CRACK_START = 0.04;
const CRACK_END = 0.13;
const EXPLODE_START = 0.13;
const EXPLODE_END = 0.2;

const WHITE = new THREE.Color("#ffffff");

/**
 * Hero centerpiece — a tetrahedral glass prism that FRACTURES on the dive.
 *
 * There is only ONE mesh, and it is the real transmissive prism the whole time.
 * Rather than swap a solid prism for a separate shard mesh (which no crossfade
 * could hide — two different materials never match), we subdivide the tetra into
 * triangular fragments and inject the crack/explode displacement straight into a
 * `meshPhysicalMaterial` via `onBeforeCompile`. Assembled (scroll 0), the
 * fragments tile the exact tetra surface with the exact hero material, so it is
 * pixel-identical to the un-fractured prism — there is no transition to notice,
 * only vertices moving as you scroll. As it detonates the same material morphs
 * (transmission ↓, colour/emissive ↑) so the flying pieces read as solid chunks.
 */
export function GlassPrism({ pal }: { pal: ScenePalette }) {
  const rot = useRef<Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const geometry = useMemo(() => buildFractureGeometry(PRISM_RADIUS, SHARD_DIVISIONS), []);
  const uniforms = useMemo(
    () => ({
      uCrack: { value: 0 },
      uExplode: { value: 0 },
      uEdgeColor: { value: new THREE.Color() },
      uEdgeI: { value: 0 },
    }),
    [],
  );
  const bodyColor = useMemo(() => new THREE.Color(pal.geodesic), [pal]);
  const emissiveColor = useMemo(() => new THREE.Color(pal.sparkle), [pal]);
  const edgeColor = useMemo(() => new THREE.Color(pal.edge), [pal]);

  // Inject the per-fragment displacement + a fresnel edge glow into the physical
  // material's shaders (so the prism reads sharp without a separate edge mesh,
  // and the glow fractures with the fragments).
  const onBeforeCompile = useCallback(
    (shader: {
      uniforms: Record<string, { value: unknown }>;
      vertexShader: string;
      fragmentShader: string;
    }) => {
      shader.uniforms.uCrack = uniforms.uCrack;
      shader.uniforms.uExplode = uniforms.uExplode;
      shader.uniforms.uEdgeColor = uniforms.uEdgeColor;
      shader.uniforms.uEdgeI = uniforms.uEdgeI;
      shader.vertexShader =
        /* glsl */ `
        attribute vec3 aCentroid;
        attribute vec3 aAxis;
        attribute float aSpread;
        attribute float aTurns;
        attribute float aCrack;
        uniform float uCrack;
        uniform float uExplode;
        vec3 fractureRot(vec3 v, vec3 a, float ang) {
          float c = cos(ang), s = sin(ang);
          return v * c + cross(a, v) * s + a * dot(a, v) * (1.0 - c);
        }
      ` + shader.vertexShader;
      // Rotate each fragment's normal by its tumble (explosion only).
      shader.vertexShader = shader.vertexShader.replace(
        "#include <beginnormal_vertex>",
        /* glsl */ `#include <beginnormal_vertex>
        objectNormal = fractureRot(objectNormal, aAxis, aTurns * uExplode);`,
      );
      // Progressive crack (each piece opens once the front passes its threshold)
      // + cubic ease-out explosion throw with tumble. `position` is stored
      // relative to the fragment centroid, so we spin it then re-offset.
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        /* glsl */ `#include <begin_vertex>
        {
          const float GAP = 0.18;
          const float BAND = 0.4;
          float thr = aCrack * (1.0 - BAND);
          float crackAmt = smoothstep(thr, thr + BAND, uCrack);
          float ee = 1.0 - pow(1.0 - uExplode, 3.0);
          float ang = aTurns * uExplode;
          vec3 dir = normalize(aCentroid);
          vec3 cen = aCentroid + dir * (crackAmt * GAP + ee * aSpread);
          transformed = cen + fractureRot(position, aAxis, ang);
        }`,
      );
      // Fresnel edge glow → bright rim on grazing angles, like the old wireframe
      // edges but self-contained per fragment (added to the emissive so it blooms).
      shader.fragmentShader =
        "uniform vec3 uEdgeColor;\nuniform float uEdgeI;\n" + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
        float edgeFres = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0), 1.8);
        totalEmissiveRadiance += uEdgeColor * edgeFres * uEdgeI;`,
      );
    },
    [uniforms],
  );

  useFrame((_, d) => {
    // Spin + Float the whole prism (fragments inherit it, so they break from the
    // correct spinning positions).
    const g = rot.current;
    if (g) {
      g.rotation.y += d * 0.22;
      g.rotation.x += d * 0.08;
    }
    const p = scrollProgress.current;
    const crack = smoothstep(CRACK_START, CRACK_END, p);
    const explode = smoothstep(EXPLODE_START, EXPLODE_END, p);
    uniforms.uCrack.value = crack;
    uniforms.uExplode.value = explode;
    uniforms.uEdgeColor.value.copy(edgeColor);
    uniforms.uEdgeI.value = pal.additive ? 4.5 : 2.0;

    const mesh = meshRef.current;
    const mat = matRef.current;
    if (mesh) mesh.visible = explode < 0.999;
    if (mat) {
      // Clear single-sided glass while whole (avoids the back faces darkening the
      // hero); double-sided once it breaks so tumbling fragments show both faces.
      mat.side = crack > 0.01 ? THREE.DoubleSide : THREE.FrontSide;
      // Clear glass when assembled (crack 0 → the hero look); solidify into
      // opaque, glowing chunks as it cracks so the explosion reads as solid.
      mat.transmission = 1 - 0.94 * crack;
      mat.roughness = pal.rough + (0.5 - pal.rough) * crack;
      mat.color.copy(WHITE).lerp(bodyColor, 0.75 * crack);
      mat.emissive.copy(emissiveColor);
      mat.emissiveIntensity = (pal.additive ? 0.6 : 0.18) * crack;
      mat.opacity = 1 - smoothstep(0.7, 1, explode);
    }
  });

  return (
    <Float speed={0.7} rotationIntensity={0.28} floatIntensity={0.5}>
      <group ref={rot}>
        <mesh ref={meshRef} geometry={geometry} frustumCulled={false}>
          <meshPhysicalMaterial
            ref={matRef}
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
            emissive="#000000"
            attenuationColor={pal.glassTint}
            attenuationDistance={pal.glassTintDist}
            transparent
            onBeforeCompile={onBeforeCompile}
          />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * Build a tetrahedron subdivided into `4·divisions²` triangular fragments.
 * Positions are stored RELATIVE to each fragment's centroid (so the shader can
 * spin each piece in place); `aCentroid` carries the world offset, and per-piece
 * `aAxis` / `aSpread` / `aTurns` / `aCrack` seed the break. Non-indexed (flat
 * facets) so the assembled shell shades exactly like the solid tetra.
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
