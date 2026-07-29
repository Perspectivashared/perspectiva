import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Edges } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh } from "three";
import type { ScenePalette } from "../palettes";
import { scrollProgress } from "../scrollProgress";
import { hash, smoothstep } from "./motion";

const IS_NARROW = typeof window !== "undefined" && window.innerWidth < 768;
const SHARD_COUNT = IS_NARROW ? 16 : 30;

// Scroll windows (in scrollProgress terms — normalized page progress). The
// break is timed EARLY, while the prism is still centre-stage and unoccluded:
// past ~p=0.10 the DOM content cards rise over the canvas centre, so a later
// shatter would burst behind them. The intact prism cracks at SHATTER_START;
// its shards then burst outward and tumble across [SHATTER_START, SHATTER_END],
// whooshing past the diving camera (and out to the still-visible edges) before
// fading into the inner swarm. All a pure function of scroll → scrubbing back
// up reassembles the glass exactly.
const SOLID_FADE_IN = 0.05;
const SOLID_FADE_OUT = 0.1;
const SHATTER_START = 0.05;
const SHATTER_END = 0.22;

/**
 * Hero centerpiece — a tetrahedral glass prism. Core meshPhysicalMaterial (NOT
 * drei MeshTransmissionMaterial, which would sample the particles). The
 * per-theme axis is the LOCKED look: DARK = frosted (rough 0.24, subtle
 * dispersion), LIGHT = clear crystal (rough 0.05, vivid edge CA). Reads
 * transparent because the opaque Backdrop sits behind it.
 *
 * On the dive the solid prism doesn't just dissolve — it SHATTERS into
 * `PrismShards` that fly outward and past the viewer, a breaking-glass
 * transition into the inner particle field.
 */
export function GlassPrism({ pal }: { pal: ScenePalette }) {
  const spin = useRef<Mesh>(null);
  useFrame((_, d) => {
    const m = spin.current;
    if (!m) return;
    m.rotation.y += d * 0.22;
    m.rotation.x += d * 0.08;
    // Hold full size, then dissolve fast right as the shatter begins so the
    // shards take over the glass presence rather than the solid lingering.
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
          <tetrahedronGeometry args={[2.6, 0]} />
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
 * The breaking-glass burst. One instanced mesh of chunky tetra shards, each with
 * its own outward direction (biased toward the camera so some sail past you),
 * tumble axis, throw distance and spin — all scrubbed by scroll position across
 * the shatter window. Cheap: a single draw call, no transmission (shards read as
 * glass via clearcoat + env reflections + a dark/light-aware emissive glint).
 */
function PrismShards({ pal }: { pal: ScenePalette }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const shards = useMemo(() => {
    return Array.from({ length: SHARD_COUNT }, (_, i) => {
      const th = hash(i * 1.7) * Math.PI * 2;
      const ph = Math.acos(2 * hash(i * 2.3) - 1);
      const dir = new THREE.Vector3(
        Math.sin(ph) * Math.cos(th),
        Math.sin(ph) * Math.sin(th),
        Math.cos(ph),
      );
      dir.z += 0.5; // bias forward so shards fly toward/past the viewer
      dir.normalize();
      const axis = new THREE.Vector3(
        hash(i * 3.1) - 0.5,
        hash(i * 4.3) - 0.5,
        hash(i * 5.9) - 0.5,
      ).normalize();
      return {
        dir,
        axis,
        startR: 0.5 + hash(i * 6.1) * 0.9,
        spread: 6 + hash(i * 7.7) * 7,
        turns: 0.6 + hash(i * 8.9) * 2.2,
        scale: 0.18 + hash(i * 9.3) * 0.34,
      };
    });
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;
    const s = smoothstep(SHATTER_START, SHATTER_END, scrollProgress.current);
    const vis = s > 0.001 && s < 0.999;
    mesh.visible = vis;
    if (!vis) return;
    // Ease-out throw: fast burst, then drift.
    const posEase = 1 - (1 - s) * (1 - s);
    for (let i = 0; i < shards.length; i++) {
      const d = shards[i];
      dummy.position.copy(d.dir).multiplyScalar(d.startR + d.spread * posEase);
      dummy.quaternion.setFromAxisAngle(d.axis, d.turns * Math.PI * 2 * s);
      dummy.scale.setScalar(d.scale * (1 - 0.25 * s));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    // Fade in on the crack, out as the shards leave.
    mat.opacity = 0.92 * smoothstep(0, 0.06, s) * (1 - smoothstep(0.72, 1, s));
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, SHARD_COUNT]}
      frustumCulled={false}
    >
      <tetrahedronGeometry args={[0.5, 0]} />
      <meshPhysicalMaterial
        ref={matRef}
        color={pal.edge}
        roughness={0.06}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.12}
        envMapIntensity={pal.envI * 1.6}
        emissive={pal.sparkle}
        emissiveIntensity={pal.additive ? 0.4 : 0}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}
