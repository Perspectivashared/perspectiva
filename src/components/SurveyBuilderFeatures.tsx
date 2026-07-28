import {
  Trophy,
  Target,
  Zap,
  ListChecks,
  BarChart2,
  Smartphone,
} from "lucide-react";
import FadeInView from "@/components/FadeInView";

const features = [
  {
    icon: Trophy,
    title: "Points incentive system",
    description:
      "Respondents earn a point for every survey they complete, driving genuine engagement and completion rates far above the industry average.",
  },
  {
    icon: Target,
    title: "Smart audience targeting",
    description:
      "Reach respondents matched by profession, interests, and academic background — not random strangers who don't fit your study.",
  },
  {
    icon: Zap,
    title: "AI-powered insights",
    description:
      "Automatically surface patterns, trends, and key takeaways from your response data with AI-generated summaries — no manual analysis needed.",
  },
  {
    icon: ListChecks,
    title: "6 question types",
    description:
      "Multiple choice, checkboxes, dropdown, linear scale, short text, and long text — every format your research could possibly need.",
  },
  {
    icon: BarChart2,
    title: "Real-time analytics",
    description:
      "Watch responses come in live. Interactive dashboards give you instant visibility as your data accumulates.",
  },
  {
    icon: Smartphone,
    title: "Mobile optimised",
    description:
      "Surveys render perfectly on every device. Respondents participate on the go, maximising your reach.",
  },
];

const SurveyBuilderFeatures = () => {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-4">
        <FadeInView>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--eyebrow-fg))]">
              Platform features
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
              Everything in <span className="text-primary">one platform</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Every tool you need to craft high-quality surveys, reach the right
              audience, and turn responses into real insights.
            </p>
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="mb-1.5 font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </FadeInView>
      </div>
    </section>
  );
};

export default SurveyBuilderFeatures;
