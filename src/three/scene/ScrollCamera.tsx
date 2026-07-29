import { useFrame, useThree } from "@react-three/fiber";
import type { RefObject } from "react";
import type { Group, PerspectiveCamera } from "three";
import type { PointerRef } from "../pointer";
import { scrollProgress } from "../scrollProgress";
import { damp, smoothstep, smootherstep } from "./motion";

/** Minimal structural type for the postprocessing BloomEffect (loose R3F types). */
type BloomLike = { intensity: number };

interface ScrollCameraProps {
  pointer: PointerRef;
  rigRef: RefObject<Group | null>;
  bloomRef: RefObject<BloomLike | null>;
  /** Base bloom intensity at the hero (pal.bloom); ramped down past the hero. */
  baseBloom: number;
}

/**
 * The one continuous camera. Reads the shared `scrollProgress` each frame:
 * dollies in on scroll, damped pointer parallax on the camera + rig, and ramps
 * the `heaviness` envelope (bloom → 0 as you leave the hero) so heavy WebGL
 * stays in the hero zone while the canvas persists down the page.
 */
export function ScrollCamera({ pointer, rigRef, bloomRef, baseBloom }: ScrollCameraProps) {
  const { camera } = useThree();
  useFrame((_, dt) => {
    const p = scrollProgress.current;
    const px = pointer.current.x;
    const py = pointer.current.y;

    camera.position.x = damp(camera.position.x, px * 0.6, 4, dt);
    camera.position.y = damp(camera.position.y, -py * 0.5, 4, dt);
    // Fly-through dolly: a slow, immersive dive from the hero (z=6.4) deep
    // through the prism and past the origin (z=-2.4), stretched over the first
    // third of the page. Quintic ease (no acceleration snap) + a gentle damp
    // makes it glide. The prism and geodesic dissolve (rather than shrink) as we
    // pass, revealing the inner particle swarm — a continuous zoom-in.
    const dive = smootherstep(0, 0.34, p);
    camera.position.z = damp(camera.position.z, 6.4 - dive * 8.8, 3, dt);
    camera.lookAt(0, 0, 0);

    // Subtle FOV punch at the glass-break moment (~p=0.09) — a brief widen that
    // damps back, amplifying the sense of bursting through the shards.
    const cam = camera as PerspectiveCamera;
    if (cam.isPerspectiveCamera) {
      const burst = Math.max(0, 1 - Math.abs(p - 0.09) / 0.06);
      const targetFov = 50 + burst * 4;
      if (Math.abs(cam.fov - targetFov) > 0.01) {
        cam.fov = damp(cam.fov, targetFov, 6, dt);
        cam.updateProjectionMatrix();
      }
    }

    const rig = rigRef.current;
    if (rig) {
      rig.rotation.y = damp(rig.rotation.y, p * Math.PI * 0.6 + px * 0.3, 5, dt);
      rig.rotation.x = damp(rig.rotation.x, py * 0.2, 5, dt);
    }

    const bloom = bloomRef.current;
    if (bloom) bloom.intensity = baseBloom * (1 - smoothstep(0.1, 0.34, p));
  });
  return null;
}
