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
    <section className="py-24 bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-4">
        <FadeInView>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              How it works
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Four steps to{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                better research
              </span>
            </h2>
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <div className="max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex gap-7 pb-10 last:pb-0">
                {index < steps.length - 1 && (
                  <div className="absolute left-5 top-11 bottom-0 w-px bg-linear-to-b from-primary/30 to-transparent" />
                )}

                <div className="shrink-0 w-10 h-10 rounded-xl border-2 border-border bg-background flex items-center justify-center z-10">
                  <span className="text-xs font-bold font-mono text-muted-foreground tabular-nums">
                    {step.number}
                  </span>
                </div>

                <div className="pt-1.5">
                  <h3 className="text-xl font-semibold text-foreground mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
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
