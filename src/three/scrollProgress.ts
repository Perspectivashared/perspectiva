import { useEffect } from "react";
import { getLenis } from "@/lib/scroll";

/**
 * Single source of truth for scroll position, shared between React (via lenis)
 * and the R3F render loop (which reads `scrollProgress.current` every frame).
 * `current` is normalized page progress 0..1; `velocity` is the lenis velocity.
 * Keeping ONE mutable object avoids drift between lenis, framer, and the camera.
 */
export const scrollProgress = { current: 0, velocity: 0 };

function windowProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

/**
 * Binds `scrollProgress` to lenis (preferred — smoothed progress + velocity),
 * falling back to a passive window listener. Call once, high in the scene host.
 *
 * Binding is deferred one frame: this hook's effect runs before its ancestor
 * SmoothScrollProvider's effect (child effects fire first), so lenis isn't set
 * yet at mount. lenis also drives window.scrollY, so the fallback stays correct.
 */
export function useBindScrollProgress(): void {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const onScroll = () => {
      scrollProgress.current = windowProgress();
    };
    const bind = () => {
      const lenis = getLenis();
      if (lenis) {
        scrollProgress.current = lenis.progress;
        unsubscribe = lenis.on("scroll", (l) => {
          scrollProgress.current = l.progress;
          scrollProgress.velocity = l.velocity;
        });
      } else {
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        unsubscribe = () => window.removeEventListener("scroll", onScroll);
      }
    };
    const raf = requestAnimationFrame(bind);
    return () => {
      cancelAnimationFrame(raf);
      unsubscribe?.();
    };
  }, []);
}
