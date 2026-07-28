import { Check, X } from "lucide-react";
import FadeInView from "@/components/FadeInView";

const stats = [
  { value: "3×", label: "Higher completion rate than generic survey tools" },
  { value: "24h", label: "Average time to receive your first 10 responses" },
  { value: "50+", label: "Targeted communities to distribute your survey" },
  { value: "2pts", label: "Flat cost to publish a survey — no subscriptions" },
];

type ComparisonRow = {
  feature: string;
  perspectiva: boolean;
  generic: boolean;
};

const comparison: ComparisonRow[] = [
  { feature: "Audience matched by profession & interests", perspectiva: true, generic: false },
  { feature: "Incentive system that drives real completion", perspectiva: true, generic: false },
  { feature: "Community-targeted distribution", perspectiva: true, generic: false },
  { feature: "AI-generated insights from response data", perspectiva: true, generic: false },
  { feature: "No monthly subscription required", perspectiva: true, generic: false },
  { feature: "Built-in analytics dashboard", perspectiva: true, generic: true },
];

const PlatformDifferentiators = () => {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-4">
        <FadeInView>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--eyebrow-fg))]">
              The difference
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
              Why Perspectiva outperforms{" "}
              <span className="text-primary">traditional methods</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Generic survey tools give you a blank form. Perspectiva gives you a
              motivated, targeted audience and everything needed to act on your
              data.
            </p>
          </div>
        </FadeInView>

        <FadeInView delay={0.08}>
          <div className="mx-auto mb-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.value} className="glass-panel rounded-2xl p-6 text-center">
                <div className="mb-2 font-display text-4xl font-semibold tracking-tight text-primary">
                  {stat.value}
                </div>
                <p className="text-sm leading-snug text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FadeInView>

        <FadeInView delay={0.15}>
          <div className="glass-panel mx-auto max-w-3xl overflow-hidden rounded-2xl">
            <div className="grid grid-cols-[1fr_auto_auto] items-center border-b border-border/60 px-6 py-4">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Feature
              </span>
              <span className="w-32 border-l-2 border-primary/40 text-center font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                Perspectiva
              </span>
              <span className="w-32 text-center font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Generic tools
              </span>
            </div>

            {comparison.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_auto_auto] items-center px-6 py-4 ${
                  i < comparison.length - 1 ? "border-b border-border/40" : ""
                }`}
              >
                <span className="pr-4 text-sm text-foreground">{row.feature}</span>
                <span className="flex w-32 justify-center border-l-2 border-primary/15">
                  {row.perspectiva ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                    </span>
                  ) : (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                      <X className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2.5} />
                    </span>
                  )}
                </span>
                <span className="flex w-32 justify-center">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                    {row.generic ? (
                      <Check className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2.5} />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2.5} />
                    )}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </FadeInView>
      </div>
    </section>
  );
};

export default PlatformDifferentiators;
