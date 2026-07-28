import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ROUTES, LANDING_SECTION_IDS } from "@/lib/routes";

/**
 * Landing hero — the locked "perspective" composition. Transparent so the
 * persistent WebGL prism (or CSS/SVG poster) behind it shows through; a radial
 * scrim keeps the wordmark AA over the live glass. All copy is real DOM (SEO).
 */
const Hero = () => {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* radial contrast scrim behind the wordmark → AA over the live glass */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--hero-scrim)" }}
      />

      <div className="relative flex flex-col items-center">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-[hsl(var(--eyebrow-fg))] sm:text-sm">
          <span aria-hidden>●</span> Gamified research platform
        </p>

        <h1
          className="font-display font-semibold leading-[0.9] tracking-[-0.04em] text-foreground"
          style={{ fontSize: "clamp(3.5rem, 13vw, 12rem)" }}
        >
          Perspectiva
        </h1>

        <p
          className="mt-6 font-display font-medium text-foreground"
          style={{ fontSize: "clamp(1.1rem, 2.6vw, 1.9rem)" }}
        >
          Many perspectives. <span className="text-primary">One clear picture.</span>
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link to={ROUTES.signUp}>Get Started Free</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
            <a href={`#${LANDING_SECTION_IDS.howItWorks}`}>See how it works</a>
          </Button>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          No credit card required · Free to join · Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default Hero;
