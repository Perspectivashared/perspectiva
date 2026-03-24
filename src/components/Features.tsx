import { Card } from "@/components/ui/card";
import { Trophy, Target, BarChart3, Users, Zap, Shield } from "@/components/icons/simple-icons";

const features = [
  {
    id: "point-based-system",
    icon: Trophy,
    title: "Point-Based System",
    description:
      "Complete surveys to earn points. Spend points to launch your own research.",
    gradient: "from-primary to-accent",
  },
  {
    id: "smart-matching",
    icon: Target,
    title: "Smart Matching",
    description:
      "AI-powered targeting ensures your surveys reach the right respondents.",
    gradient: "from-accent to-primary",
  },
  {
    id: "advanced-analytics",
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Get instant insights with professional-grade data visualization dashboards.",
    gradient: "from-primary to-accent",
  },
  {
    id: "community-driven",
    icon: Users,
    title: "Community Driven",
    description:
      "Join specialized communities across tech, sports, finance, and more.",
    gradient: "from-accent to-primary",
  },
  {
    id: "google-forms-integration",
    icon: Zap,
    title: "Google Forms Integration",
    description:
      "Seamlessly import your existing Google Forms or create surveys from scratch.",
    gradient: "from-primary to-accent",
  },
  {
    id: "quality-assured",
    icon: Shield,
    title: "Quality Assured",
    description:
      "Anti-bot measures and quality controls ensure reliable, authentic responses.",
    gradient: "from-accent to-primary",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Everything You Need for{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Better Research
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From survey creation to advanced analytics, we provide all the tools
            you need to succeed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className="p-8 hover:shadow-elegant transition-all duration-300 border-border/50 bg-card/50 backdrop-blur"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-glow`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
