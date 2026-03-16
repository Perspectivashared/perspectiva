import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "Sign up with Gmail and tell us about your expertise, interests, and academic background.",
  },
  {
    number: "02",
    title: "Complete Surveys",
    description:
      "Answer surveys matched to your interests. Each completed survey earns you 1 point.",
  },
  {
    number: "03",
    title: "Launch Your Research",
    description:
      "Spend 2 points to post your own survey and reach targeted respondents.",
  },
  {
    number: "04",
    title: "Gain Insights",
    description:
      "Access advanced analytics dashboards with AI-generated insights and visualizations.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold">
            How{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Perspectiva
            </span>{" "}
            Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple, gamified approach to collaborative research
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {steps.map((step) => (
            <Card
              key={step.number}
              className="p-8 bg-card/80 backdrop-blur border-border/50 hover:shadow-elegant transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                    <span className="text-2xl font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-semibold mb-3 flex items-center gap-2">
                    {step.title}
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
