import { GraduationCap, TrendingUp, MousePointerClick, Users } from "lucide-react";
import FadeInView from "@/components/FadeInView";

const useCases = [
  {
    icon: GraduationCap,
    title: "Academic research",
    description:
      "Students and professors running dissertation studies, class projects, and peer-reviewed research. Get a statistically meaningful sample fast.",
    tags: ["Dissertation", "Peer review", "Class projects"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Market research",
    description:
      "Businesses and startups validating product ideas, measuring brand perception, and gathering consumer insight before launching.",
    tags: ["Product validation", "Consumer insight", "Brand tracking"],
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: MousePointerClick,
    title: "UX & product research",
    description:
      "Product teams collecting targeted user feedback on features, flows, and prototypes — from respondents who actually match your user profile.",
    tags: ["Usability", "Feature feedback", "Prototype testing"],
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Users,
    title: "Social & behavioural studies",
    description:
      "Sociologists, psychologists, and public health researchers studying attitudes, habits, and population-wide behaviours.",
    tags: ["Behavioural science", "Public health", "Psychology"],
    color: "from-orange-500 to-amber-500",
  },
];

const UseCases = () => {
  return (
    <section className="py-24 bg-background border-t border-border/50">
      <div className="container mx-auto px-4">
        <FadeInView>
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Use cases
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Research for{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                every field
              </span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Whether you're writing a dissertation or launching a product,
              Perspectiva adapts to what you need to learn.
            </p>
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {useCases.map((uc) => {
              const Icon = uc.icon;
              return (
                <div
                  key={uc.title}
                  className="p-7 rounded-2xl border border-border/60 bg-card hover:border-primary/35 hover:shadow-elegant transition-all duration-300"
                >
                  <div
                    className={`w-11 h-11 rounded-xl bg-linear-to-br ${uc.color} flex items-center justify-center mb-5`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {uc.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    {uc.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {uc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-border/70 bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </FadeInView>
      </div>
    </section>
  );
};

export default UseCases;
