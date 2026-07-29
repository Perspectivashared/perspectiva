import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

/**
 * Fancy cursor rig — a 2D-canvas overlay across the whole landing (works over
 * the WebGL hero and the DOM sections). A dot pinned to the cursor plus TWO
 * constellation spheres of very different size that follow it with different
 * lag: each sphere is made of many faint dots, only a few of which pulse bold at
 * any moment, and only nearby bright dots are linked — so the dot positions and
 * the connections keep shifting as the cursor moves. Decorative +
 * pointer-events:none. Disabled for reduced-motion and coarse (touch) pointers.
 */

interface Dot {
  base: number; // base angle around the sphere
  phase: number; // brightness-pulse phase
  speed: number; // brightness-pulse speed
  wob: number; // radial-wobble phase
}

interface Sphere {
  radius: number;
  k: number; // spring toward the cursor (bigger = tighter/faster)
  rotSpeed: number;
  dir: 1 | -1;
  wobble: number; // radial wobble amount (fraction of radius)
  dots: Dot[];
  cx: number;
  cy: number;
}

// Two spheres: a small tight one and a large lagging one (big size difference).
const SPHERE_CFG = [
  { radius: 30, k: 0.3, rotSpeed: 0.5, dir: 1 as const, wobble: 0.14, count: 26 },
  { radius: 88, k: 0.12, rotSpeed: 0.24, dir: -1 as const, wobble: 0.09, count: 46 },
];
const LINK_DIST = 48;

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

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let active = false;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      active = true;
    };

    // A deterministic-ish spread; brightness pulses are what make only a few
    // dots bold at a time, so plain even spacing + varied phases reads organic.
    const mkDots = (n: number): Dot[] =>
      Array.from({ length: n }, (_, i) => ({
        base: (i / n) * Math.PI * 2,
        phase: (i * 2.399) % (Math.PI * 2), // golden-ish, decorrelated
        speed: 0.6 + ((i * 0.37) % 1) * 1.1,
        wob: (i * 1.7) % (Math.PI * 2),
      }));

    const spheres: Sphere[] = SPHERE_CFG.map((c) => ({
      radius: c.radius,
      k: c.k,
      rotSpeed: c.rotSpeed,
      dir: c.dir,
      wobble: c.wobble,
      dots: mkDots(c.count),
      cx: tx,
      cy: ty,
    }));

    let raf = 0;
    const tick = (now: number) => {
      const t = now / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!active) {
        raf = requestAnimationFrame(tick);
        return;
      }

      // Screen positions + live alpha of every dot, gathered for linking.
      const nodes: { x: number; y: number; a: number }[] = [];
      for (const s of spheres) {
        s.cx += (tx - s.cx) * s.k;
        s.cy += (ty - s.cy) * s.k;
        const rotate = t * s.rotSpeed * s.dir;
        for (const d of s.dots) {
          const ang = d.base + rotate;
          const r = s.radius * (1 + s.wobble * Math.sin(t * 0.8 + d.wob));
          const x = s.cx + Math.cos(ang) * r;
          const y = s.cy + Math.sin(ang) * r;
          // Sharp pulse → mostly dim, occasionally bold. Only a few peak at once.
          const pulse = Math.pow(0.5 + 0.5 * Math.sin(t * d.speed + d.phase), 6);
          nodes.push({ x, y, a: 0.16 + 0.72 * pulse });
        }
      }

      // Links: only between nearby, currently-bright dots → a sparse web that
      // keeps re-wiring as positions drift and brightness cycles.
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        if (p.a < 0.32) continue;
        for (let j = i + 1; j < nodes.length; j++) {
          const q = nodes[j];
          if (q.a < 0.3) continue;
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK_DIST) continue;
          const la = 0.22 * Math.min(p.a, q.a) * (1 - dist / LINK_DIST);
          ctx.strokeStyle = `rgba(${rgb},${la.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      // Dots: faint by default, a few bold + larger where the pulse peaks.
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${rgb},${n.a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1 + 2.4 * ((n.a - 0.16) / 0.72), 0, Math.PI * 2);
        ctx.fill();
      }

      // Core dot pinned to the cursor.
      ctx.fillStyle = `rgba(${rgb},0.9)`;
      ctx.beginPath();
      ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
      ctx.fill();

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
