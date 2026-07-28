import FadeInView from "@/components/FadeInView";

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description:
      "Sign up with your Gmail and tell us about your expertise, interests, and academic background.",
  },
  {
    number: "02",
    title: "Complete surveys",
    description:
      "Answer surveys matched to your interests. Each completed survey earns you 1 point toward your next post.",
  },
  {
    number: "03",
    title: "Launch your research",
    description:
      "Spend 2 points to post your own survey and reach targeted respondents in your community.",
  },
  {
    number: "04",
    title: "Gain insights",
    description:
      "Access advanced analytics dashboards with AI-generated summaries and interactive visualizations.",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-4">
        <FadeInView>
          <div className="mb-16 text-center">
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--eyebrow-fg))]">
              How it works
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
              Four steps to <span className="text-primary">better research</span>
            </h2>
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <div className="mx-auto max-w-2xl">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex gap-7 pb-10 last:pb-0">
                {index < steps.length - 1 && (
                  <div className="absolute bottom-0 left-5 top-11 w-px bg-linear-to-b from-primary/40 to-transparent" />
                )}

                <div className="glass-panel z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <span className="font-mono text-xs font-bold tabular-nums text-primary">
                    {step.number}
                  </span>
                </div>

                <div className="pt-1.5">
                  <h3 className="mb-1.5 text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </FadeInView>
      </div>
    </section>
  );
};

export default HowItWorks;
