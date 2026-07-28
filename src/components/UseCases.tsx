import { GraduationCap, TrendingUp, MousePointerClick, Users } from "lucide-react";
import FadeInView from "@/components/FadeInView";

const useCases = [
  {
    icon: GraduationCap,
    title: "Academic research",
    description:
      "Students and professors running dissertation studies, class projects, and peer-reviewed research. Get a statistically meaningful sample fast.",
    tags: ["Dissertation", "Peer review", "Class projects"],
  },
  {
    icon: TrendingUp,
    title: "Market research",
    description:
      "Businesses and startups validating product ideas, measuring brand perception, and gathering consumer insight before launching.",
    tags: ["Product validation", "Consumer insight", "Brand tracking"],
  },
  {
    icon: MousePointerClick,
    title: "UX & product research",
    description:
      "Product teams collecting targeted user feedback on features, flows, and prototypes — from respondents who actually match your user profile.",
    tags: ["Usability", "Feature feedback", "Prototype testing"],
  },
  {
    icon: Users,
    title: "Social & behavioural studies",
    description:
      "Sociologists, psychologists, and public health researchers studying attitudes, habits, and population-wide behaviours.",
    tags: ["Behavioural science", "Public health", "Psychology"],
  },
];

const UseCases = () => {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-4">
        <FadeInView>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--eyebrow-fg))]">
              Use cases
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
              Research for <span className="text-primary">every field</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Whether you're writing a dissertation or launching a product,
              Perspectiva adapts to what you need to learn.
            </p>
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {useCases.map((uc) => {
              const Icon = uc.icon;
              return (
                <div
                  key={uc.title}
                  className="glass-panel rounded-2xl p-7 transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {uc.title}
                  </h3>
                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                    {uc.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {uc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-border/70 bg-primary/5 px-2.5 py-0.5 font-mono text-xs font-medium text-muted-foreground"
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
