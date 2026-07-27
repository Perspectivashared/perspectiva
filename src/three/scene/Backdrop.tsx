import { useMemo } from "react";
import type { ScenePalette } from "../palettes";
import { makeGradientTexture } from "./textures";

/**
 * Opaque gradient plane behind the prism. Without it the prism's transmission
 * has nothing opaque behind → it refracts the bright light rig and looks white.
 * With it, the prism refracts the dark/light backdrop → reads transparent.
 */
export function Backdrop({ pal }: { pal: ScenePalette }) {
  const tex = useMemo(() => makeGradientTexture(pal.bgStops), [pal]);
  return (
    <mesh position={[0, 0, -9]}>
      <planeGeometry args={[90, 56]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}
