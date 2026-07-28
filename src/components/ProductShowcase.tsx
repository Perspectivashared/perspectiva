import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

/**
 * Product showcase — the survey UI rendered on a frosted glass panel, floating
 * over the continuing WebGL field below the hero (the first "canvas continues"
 * section). Replaces the old in-hero SurveyMockup in the v3 glass language.
 */
const OPTIONS = [
  { label: "Several times a week", selected: false },
  { label: "Once a week", selected: true },
  { label: "A few times a month", selected: false },
  { label: "Rarely", selected: false },
];

const ProductShowcase = () => {
  return (
    <section className="relative px-6 py-28 sm:py-36">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        {/* Copy — on its own glass to stay AA over the live field */}
        <div className="glass-panel rounded-2xl p-8 shadow-lg">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-[hsl(var(--eyebrow-fg))]">
            See it in action
          </p>
          <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Every answer, <span className="text-primary">one clear signal</span>
          </h2>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Take surveys that respect your time, earn points on every response,
            and watch raw opinions resolve into insight.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 px-8">
            <Link to={ROUTES.signUp}>Start earning points</Link>
          </Button>
        </div>

        {/* Survey preview on a frosted glass panel */}
        <div className="glass-panel overflow-hidden rounded-2xl shadow-lg">
          {/* browser chrome */}
          <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="mx-3 flex h-5 flex-1 items-center rounded-md bg-background/40 px-2.5">
              <span className="truncate font-mono text-[10px] text-muted-foreground">
                perspectiva.app/survey/…
              </span>
            </div>
          </div>

          <div className="p-5">
            {/* progress */}
            <div className="mb-5 flex items-center gap-2.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-primary" />
              </div>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">2 / 3</span>
            </div>

            <p className="mb-3.5 text-sm font-semibold leading-snug text-foreground">
              How often do you participate in academic research surveys?
            </p>

            <div className="space-y-2">
              {OPTIONS.map((opt) => (
                <div
                  key={opt.label}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    opt.selected
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border/60 bg-background/20 text-muted-foreground"
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${
                      opt.selected ? "border-primary bg-primary" : "border-border"
                    }`}
                  >
                    {opt.selected && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                  </span>
                  <span>{opt.label}</span>
                  {opt.selected && (
                    <span className="ml-auto font-mono text-xs font-semibold text-primary">+1 pt</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
              <span className="font-mono text-xs text-muted-foreground">Research community</span>
              <span className="font-mono text-xs font-semibold text-primary">Next →</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
