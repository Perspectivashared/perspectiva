import { type PropsWithChildren, useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "@/lib/scroll";

export const SmoothScrollProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    setLenis(lenis);

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Radix UI sets data-scroll-locked="1" on <body> when any Dialog/Sheet opens.
    // Stop Lenis so it no longer intercepts wheel events while a modal is open.
    const observer = new MutationObserver(() => {
      if (document.body.dataset.scrollLocked === undefined) {
        lenis.start();
      } else {
        lenis.stop();
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
};
