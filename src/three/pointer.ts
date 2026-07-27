import { useEffect, useRef } from "react";

export type PointerRef = { current: { x: number; y: number } };

/**
 * Normalized (-1..1) mouse position, updated on mousemove. Read inside useFrame
 * for damped camera/rig/wordmark parallax. One shared ref avoids re-renders.
 */
export function usePointer(): PointerRef {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return pointer;
}
