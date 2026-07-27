import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Edges } from "@react-three/drei";
import type { Mesh } from "three";
import type { ScenePalette } from "../palettes";

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
    if (spin.current) {
      spin.current.rotation.y += d * 0.22;
      spin.current.rotation.x += d * 0.08;
    }
  });
  return (
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
  );
}
