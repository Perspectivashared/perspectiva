import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { ScenePalette } from "../palettes";
import { scrollProgress } from "../scrollProgress";
import { smoothstep } from "./motion";

/** Faint secondary accent behind the prism — a large wireframe geodesic that
 *  auto-rotates slowly. Per-theme colour/opacity keeps it a whisper, not a
 *  competing focal point. Recedes with the prism past the showcase. */
export function SecondaryGeodesic({ pal }: { pal: ScenePalette }) {
  const ref = useRef<Group>(null);
  useFrame((_, d) => {
    if (ref.current) {
      ref.current.rotation.y += d * 0.045;
      const s = 1 - smoothstep(0.16, 0.21, scrollProgress.current);
      ref.current.scale.setScalar(4.4 * Math.max(0.0001, s));
      ref.current.visible = s > 0.01;
    }
  });
  return (
    <group ref={ref} position={[0, 0, -1.6]} scale={4.4}>
      <mesh>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial wireframe color={pal.geodesic} transparent opacity={pal.geoOpacity} />
      </mesh>
    </group>
  );
}
