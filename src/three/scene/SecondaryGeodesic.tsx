import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, MeshBasicMaterial } from "three";
import type { ScenePalette } from "../palettes";
import { scrollProgress } from "../scrollProgress";
import { smoothstep } from "./motion";

/** Faint secondary accent behind the prism — a large wireframe geodesic that
 *  auto-rotates slowly. Per-theme colour/opacity keeps it a whisper, not a
 *  competing focal point. Holds its size so the camera flies INSIDE it, then
 *  fades out once we've passed through — an enclosure that dissolves, not a
 *  shape that shrinks. */
export function SecondaryGeodesic({ pal }: { pal: ScenePalette }) {
  const ref = useRef<Group>(null);
  const matRef = useRef<MeshBasicMaterial>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * 0.045;
    const mat = matRef.current;
    if (mat) {
      // Linger through the dive (we're inside it), then dissolve for calm content.
      const o = 1 - smoothstep(0.2, 0.34, scrollProgress.current);
      mat.opacity = pal.geoOpacity * o;
      if (ref.current) ref.current.visible = o > 0.01;
    }
  });
  return (
    <group ref={ref} position={[0, 0, -1.6]} scale={4.4}>
      <mesh>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial ref={matRef} wireframe color={pal.geodesic} transparent opacity={pal.geoOpacity} />
      </mesh>
    </group>
  );
}
