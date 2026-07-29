import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

/**
 * Fancy cursor rig — a 2D-canvas overlay across the whole landing (works over
 * the WebGL hero and the DOM sections). Three layered pieces:
 *  1. a solid dot pinned to the cursor,
 *  2. an elastic ring that lags behind and stretches along the direction of
 *     travel (squashing as it speeds up),
 *  3. a cursor-following "orb" — concentric rings of dots joined by lines that
 *     rotate and squash with movement, so the dots and connections shift as the
 *     cursor moves.
 * Decorative + pointer-events:none, so it never blocks clicks. Disabled for
 * reduced-motion and coarse (touch) pointers.
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

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Cursor target + two springs: the ring (fast) and the orb centre (slow).
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;
    let ox = tx;
    let oy = ty;
    let pox = ox;
    let poy = oy;
    let active = false;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      active = true;
    };

    const RINGS = 4;
    const PER = 12;
    const BASE = 13; // innermost ring radius; rings step out by this
    let rot = 0;

    let raf = 0;
    const tick = () => {
      rx += (tx - rx) * 0.35;
      ry += (ty - ry) * 0.35;
      ox += (tx - ox) * 0.12;
      oy += (ty - oy) * 0.12;
      const vx = ox - pox;
      const vy = oy - poy;
      pox = ox;
      poy = oy;
      const speed = Math.min(Math.hypot(vx, vy), 40);
      const ang = Math.atan2(vy, vx);
      rot += 0.004 + speed * 0.006;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!active) {
        raf = requestAnimationFrame(tick);
        return;
      }

      // Squash/stretch the orb along the direction of travel.
      const stretch = 1 + speed * 0.03;
      const squash = 1 - speed * 0.012;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const project = (r: number, a: number): [number, number] => {
        const cxp = Math.cos(a) * r;
        const cyp = Math.sin(a) * r;
        // into velocity frame, scale, back to screen
        const lx = (cxp * ca + cyp * sa) * stretch;
        const ly = (-cxp * sa + cyp * ca) * squash;
        return [ox + lx * ca - ly * sa, oy + lx * sa + ly * ca];
      };

      const pts: [number, number][][] = [];
      for (let i = 0; i < RINGS; i++) {
        const r = BASE * (i + 1);
        const spin = rot * (i % 2 ? -1 : 1); // alternate ring spin direction
        const ring: [number, number][] = [];
        for (let k = 0; k < PER; k++) {
          ring.push(project(r, (k / PER) * Math.PI * 2 + spin));
        }
        pts.push(ring);
      }

      // Ring polygons.
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${rgb},0.13)`;
      for (let i = 0; i < RINGS; i++) {
        ctx.beginPath();
        for (let k = 0; k <= PER; k++) {
          const [x, y] = pts[i][k % PER];
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // Radial spokes between adjacent rings.
      ctx.strokeStyle = `rgba(${rgb},0.07)`;
      for (let i = 0; i < RINGS - 1; i++) {
        for (let k = 0; k < PER; k++) {
          ctx.beginPath();
          ctx.moveTo(pts[i][k][0], pts[i][k][1]);
          ctx.lineTo(pts[i + 1][k][0], pts[i + 1][k][1]);
          ctx.stroke();
        }
      }
      // Dots at every node (brighter toward the centre).
      for (let i = 0; i < RINGS; i++) {
        ctx.fillStyle = `rgba(${rgb},${0.5 - i * 0.08})`;
        for (let k = 0; k < PER; k++) {
          ctx.beginPath();
          ctx.arc(pts[i][k][0], pts[i][k][1], 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Elastic ring — lags between orb and cursor, stretched by speed.
      ctx.strokeStyle = `rgba(${rgb},0.5)`;
      ctx.lineWidth = 1.5;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(ang);
      ctx.scale(1 + speed * 0.02, Math.max(0.5, 1 - speed * 0.012));
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

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
