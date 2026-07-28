import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
}

/**
 * Soft particle trail that follows the cursor across the whole landing — a
 * lightweight 2D-canvas overlay (works over both the WebGL hero and the DOM
 * sections). Decorative + pointer-events:none, so it never blocks clicks.
 * Disabled for reduced-motion and coarse (touch) pointers.
 */
export default function CursorParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rgb = resolvedTheme === "dark" ? "174,212,255" : "63,111,202";
    const parts: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let lastSpawn = 0;
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastSpawn < 16) return;
      lastSpawn = now;
      for (let i = 0; i < 2; i++) {
        parts.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6 - 0.2,
          life: 0,
          max: 600 + Math.random() * 400,
          size: 1.5 + Math.random() * 2.5,
        });
      }
      if (parts.length > 200) parts.splice(0, parts.length - 200);
    };

    let prev = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const dt = t - prev;
      prev = t;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        if (p.life >= p.max) {
          parts.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt * 0.06;
        p.y += p.vy * dt * 0.06;
        const a = (1 - p.life / p.max) * 0.5;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb},${a})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [resolvedTheme]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[60]" />;
}
