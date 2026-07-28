import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

interface Spark {
  x: number;
  y: number;
  vy: number;
  drift: number;
  phase: number;
  twinkle: number;
  size: number;
  base: number;
}

interface HighlightParticlesProps {
  /** How many accent sparks to keep alive. Kept low for calm. */
  count?: number;
  className?: string;
}

/**
 * Calm accent particles bounded to a single highlight (a CTA, a finale panel).
 * Fills its nearest positioned ancestor — mount inside a `relative` wrapper.
 * Slow-rising, softly twinkling dots in the theme accent, re-seeding at the
 * bottom as they exit the top. Decorative + pointer-events:none; disabled for
 * reduced-motion. Complements the ambient field + cursor trail with a focused
 * touch on the major highlights.
 */
export default function HighlightParticles({
  count = 16,
  className,
}: HighlightParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rgb = resolvedTheme === "dark" ? "174,212,255" : "63,111,202";
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = (atBottom: boolean): Spark => ({
      x: Math.random() * w,
      y: atBottom ? h + Math.random() * 20 : Math.random() * h,
      vy: 4 + Math.random() * 6, // px/sec, slow rise
      drift: (Math.random() - 0.5) * 5,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.6 + Math.random() * 1.2,
      size: 1 + Math.random() * 2,
      base: 0.18 + Math.random() * 0.22,
    });

    resize();
    const sparks: Spark[] = Array.from({ length: count }, () => seed(false));

    let prev = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const dt = Math.min((t - prev) / 1000, 0.05);
      prev = t;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of sparks) {
        s.y -= s.vy * dt;
        s.x += s.drift * dt;
        s.phase += s.twinkle * dt;
        if (s.y < -10) Object.assign(s, seed(true));
        const a = s.base * (0.55 + 0.45 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb},${a})`;
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [count, resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
    />
  );
}
