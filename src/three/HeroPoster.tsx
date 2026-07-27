/**
 * CSS/SVG fallback for the hero backdrop — rendered instead of the WebGL canvas
 * on no-WebGL / reduced-motion / low-power / mobile. Purely decorative
 * (aria-hidden); the wordmark/tagline live in Hero.tsx on top of this, so all
 * copy stays in the DOM and crawlable. Theme-correct via P0 tokens.
 */
export function HeroPoster() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ background: "var(--gradient-section), hsl(var(--background))" }}
    >
      <svg
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2"
        width="min(70vw, 560px)"
        height="min(70vw, 560px)"
        viewBox="0 0 200 200"
        fill="none"
      >
        {/* faint geodesic halo */}
        <circle cx="100" cy="100" r="82" stroke="hsl(var(--mark-faded))" strokeWidth="0.4" opacity="0.6" />
        <circle cx="100" cy="100" r="60" stroke="hsl(var(--mark-faded))" strokeWidth="0.4" opacity="0.4" />
        {/* tetrahedral prism silhouette (matches the hero centerpiece) */}
        <g stroke="hsl(var(--mark-strong))" strokeWidth="0.7" strokeLinejoin="round" opacity="0.7">
          <polygon points="100,26 26,158 174,158" />
          <path d="M100,26 L124,112 M26,158 L124,112 M174,158 L124,112" />
        </g>
      </svg>
    </div>
  );
}
