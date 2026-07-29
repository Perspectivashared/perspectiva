import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Edges } from "@react-three/drei";
import type { Mesh } from "three";
import type { ScenePalette } from "../palettes";
import { scrollProgress } from "../scrollProgress";
import { smoothstep } from "./motion";

/**
 * Hero centerpiece — a tetrahedral glass prism. Core meshPhysicalMaterial (NOT
 * drei MeshTransmissionMaterial, which would sample the particles). The
 * per-theme axis is the LOCKED look: DARK = frosted (rough 0.24, subtle
 * dispersion), LIGHT = clear crystal (rough 0.05, vivid edge CA). Reads
 * transparent because the opaque Backdrop sits behind it.
 */
export function GlassPrism({ pal }: { pal: ScenePalette }) {
  const spin = useRef<Mesh>(null);
  useFrame((_, d) => {
    const m = spin.current;
    if (!m) return;
    m.rotation.y += d * 0.22;
    m.rotation.x += d * 0.08;
    // Fly-through: hold full size and DISSOLVE as the camera dives through, so
    // the prism engulfs the view then melts into the inner particles — instead
    // of shrinking away. Fade the physical material AND the wireframe edges.
    const o = 1 - smoothstep(0.1, 0.2, scrollProgress.current);
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
    </group>
  );
}
