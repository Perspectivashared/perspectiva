import { useEffect, useState } from "react";

/**
 * Progressive-enhancement gate for the landing WebGL scene.
 *
 * The heavy persistent canvas only runs on a capable, motion-OK, wide-enough
 * client. Everywhere else we render the CSS/SVG poster instead. Landing text
 * lives in the DOM regardless, so content stays crawlable on both paths.
 */

export interface SceneEnv {
  hasWebGL2: boolean;
  reducedMotion: boolean;
  cores: number;
  /** navigator.deviceMemory (GB) — undefined on browsers that don't expose it. */
  memory: number | undefined;
  width: number;
}

/** Pure decision — unit-tested. */
export function computeSceneEnabled(env: SceneEnv): boolean {
  return (
    env.hasWebGL2 &&
    !env.reducedMotion &&
    env.cores > 4 &&
    (env.memory === undefined || env.memory > 4) &&
    env.width >= 768
  );
}

function detectWebGL2(): boolean {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

function readEnv(): SceneEnv {
  return {
    hasWebGL2: detectWebGL2(),
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    cores: navigator.hardwareConcurrency ?? 8,
    memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
    width: window.innerWidth,
  };
}

/**
 * Live gate for React. Starts `false` (poster-first, progressive), resolves on
 * mount, and re-evaluates on resize + reduced-motion change.
 */
export function useSceneEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const update = () => setEnabled(computeSceneEnabled(readEnv()));
    update();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    window.addEventListener("resize", update);
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      mq.removeEventListener("change", update);
    };
  }, []);
  return enabled;
}
