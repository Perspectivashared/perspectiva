import { useEffect, useRef, type CSSProperties } from "react";

interface RepelTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
}

const RADIUS = 150; // cursor influence radius (px)
const MAX_PUSH = 30; // furthest a letter shifts (px)

/**
 * A heading whose letters repel away from the cursor and spring back — the
 * Resn-style interactive wordmark. Each character is its own inline-block span
 * translated per frame; the underlying text stays a real <h1> (aria-label) for
 * SEO / screen readers. Falls back to plain static text for reduced-motion and
 * coarse (touch) pointers.
 */
export default function RepelText({ text, className, style }: RepelTextProps) {
  const rootRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const root = rootRef.current;
    if (!root) return;
    const spans = Array.from(root.querySelectorAll<HTMLSpanElement>("[data-ch]"));
    const cur = spans.map(() => ({ x: 0, y: 0 }));
    let px = -9999;
    let py = -9999;
    const onMove = (e: MouseEvent) => {
      px = e.clientX;
      py = e.clientY;
    };

    let raf = 0;
    const tick = () => {
      for (let i = 0; i < spans.length; i++) {
        const rect = spans[i].getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - px;
        const dy = cy - py;
        const dist = Math.hypot(dx, dy) || 1;
        let tx = 0;
        let ty = 0;
        if (dist < RADIUS) {
          const f = 1 - dist / RADIUS;
          const push = f * f * MAX_PUSH; // ease-in falloff → soft near the edge
          tx = (dx / dist) * push;
          ty = (dy / dist) * push;
        }
        // Spring toward the target offset (and back to 0 when the cursor leaves).
        cur[i].x += (tx - cur[i].x) * 0.18;
        cur[i].y += (ty - cur[i].y) * 0.18;
        spans[i].style.transform = `translate(${cur[i].x.toFixed(2)}px, ${cur[i].y.toFixed(2)}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [text]);

  return (
    <h1 ref={rootRef} aria-label={text} className={className} style={{ whiteSpace: "nowrap", ...style }}>
      {text.split("").map((ch, i) => (
        <span key={i} data-ch aria-hidden style={{ display: "inline-block", willChange: "transform" }}>
          {ch}
        </span>
      ))}
    </h1>
  );
}
