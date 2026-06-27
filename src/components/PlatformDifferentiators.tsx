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
    <section className="py-24 bg-background border-t border-border/50">
      <div className="container mx-auto px-4">
        <FadeInView>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              The difference
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Why Perspectiva outperforms{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                traditional methods
              </span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Generic survey tools give you a blank form. Perspectiva gives you a
              motivated, targeted audience and everything needed to act on your
              data.
            </p>
          </div>
        </FadeInView>

        <FadeInView delay={0.08}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-14">
            {stats.map((stat) => (
              <div
                key={stat.value}
                className="p-6 rounded-2xl border border-border/60 bg-card text-center"
              >
                <div className="text-4xl font-bold tracking-tighter bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground leading-snug">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FadeInView>

        <FadeInView delay={0.15}>
          <div className="max-w-3xl mx-auto rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] items-center px-6 py-4 border-b border-border/60 bg-muted/40">
              <span className="text-sm font-semibold text-foreground">Feature</span>
              <span className="w-32 text-center text-sm font-semibold text-primary border-l-2 border-primary/40">
                Perspectiva
              </span>
              <span className="w-32 text-center text-sm font-semibold text-muted-foreground">Generic tools</span>
            </div>

            {comparison.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_auto_auto] items-center px-6 py-4 ${
                  i < comparison.length - 1 ? "border-b border-border/40" : ""
                }`}
              >
                <span className="text-sm text-foreground pr-4">{row.feature}</span>
                <span className="w-32 flex justify-center border-l-2 border-primary/15 bg-primary/3">
                  {row.perspectiva ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                      <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                      <X className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.5} />
                    </span>
                  )}
                </span>
                <span className="w-32 flex justify-center">
                  {row.generic ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                      <Check className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.5} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                      <X className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.5} />
                    </span>
                  )}
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
