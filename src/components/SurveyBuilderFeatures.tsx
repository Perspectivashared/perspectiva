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
    <section className="py-24 bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-4">
        <FadeInView>
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Platform features
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Everything in{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                one platform
              </span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Every tool you need to craft high-quality surveys, reach the right
              audience, and turn responses into real insights.
            </p>
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/35 hover:shadow-elegant transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
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
