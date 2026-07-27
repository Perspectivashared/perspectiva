import { Environment, Lightformer } from "@react-three/drei";
import type { ScenePalette } from "../palettes";

/**
 * In-scene light rig — three Lightformers baked once into an environment map
 * (`frames={1}`), plus fill lights. No external HDRI fetch (CSP / offline-safe).
 * The prism's refraction and facet sheen come entirely from this rig.
 */
export function SceneEnvironment({ pal }: { pal: ScenePalette }) {
  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer
          position={[0, 3, 2]}
          scale={6}
          intensity={pal.lightformers[0][1]}
          color={pal.lightformers[0][0]}
          form="rect"
        />
        <Lightformer
          position={[-5, -1, 1]}
          scale={4}
          intensity={pal.lightformers[1][1]}
          color={pal.lightformers[1][0]}
          form="rect"
        />
        <Lightformer
          position={[5, 1, -2]}
          scale={4}
          intensity={pal.lightformers[2][1]}
          color={pal.lightformers[2][0]}
          form="circle"
        />
      </Environment>
      <ambientLight intensity={pal.ambient} />
      <directionalLight position={[5, 6, 5]} intensity={1.5} />
    </>
  );
}
