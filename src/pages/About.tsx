import { AppShell } from "@/shared/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import {
  Users,
  Target,
  BarChart3,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

const HOW_IT_WORKS = [
  {
    icon: Users,
    gradient: "from-primary to-accent",
    title: "For You (Community)",
    body: "Join a curated pool of respondents and get early access to real startup ideas. Answer surveys, share your opinions, and earn rewards while shaping products before they go live.",
  },
  {
    icon: Target,
    gradient: "from-accent to-primary",
    title: "For Founders & Teams",
    body: "Test key decisions before committing time and money. Run structured surveys to validate pricing, features, positioning, and onboarding — with users that actually match your market.",
  },
  {
    icon: BarChart3,
    gradient: "from-primary to-accent",
    title: "Create & Launch Surveys",
    body: "Build surveys in minutes and distribute them to a relevant audience. Collect responses, track engagement, and get clear insights without needing a full research team.",
  },
];

const DIFFERENTIATORS = [
  "Targeted respondents instead of random samples",
  "Incentive-aligned participation for higher quality feedback",
  "Structured outputs that lead to decisions, not just raw data",
];

const About = () => (
  <AppShell backgroundClassName="bg-background" mainClassName="static-page-main">
    {/* ── Hero ─────────────────────────────────────────────────── */}
    <section className="relative overflow-hidden bg-gradient-subtle">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>
      <div className="container mx-auto px-4 pt-36 pb-24 relative z-10 static-fade-in">
        <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 max-w-4xl">
          Build what people{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            actually want.
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-4">
          Perspectiva is a decision-validation platform for founders, student
          builders, and early product teams who need real signal before they
          build.
        </p>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          In today&apos;s landscape, too many ideas are validated through
          intuition, small biased samples, or AI alone. That leads to products
          being launched without real demand. Perspectiva exists to solve that
          gap — by connecting ideas directly to the people they are meant for.
        </p>
      </div>
    </section>

    {/* ── How it works ─────────────────────────────────────────── */}
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold">
            How it{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three ways to engage — as a respondent, a founder, or a builder.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map(({ icon: Icon, gradient, title, body }) => (
            <Card
              key={title}
              className="p-8 hover:shadow-elegant transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center mb-6 shadow-glow`}
              >
                <Icon className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* thin separator */}
    <div aria-hidden="true" className="h-px bg-border/30 mx-8" />

    {/* ── What makes Perspectiva different ─────────────────────── */}
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Not just another{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                survey tool.
              </span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Responses are structured, analysed, and transformed into
              actionable insights — not just raw data, but direction.
            </p>
            <ul className="space-y-4">
              {DIFFERENTIATORS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-5 h-5 text-primary shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card className="p-8 border-primary/25 bg-card/80 backdrop-blur-sm shadow-elegant">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 shadow-glow">
              <Lightbulb className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <blockquote className="text-2xl font-semibold leading-snug text-foreground mb-4">
              &ldquo;Every interaction is designed to create better
              signal.&rdquo;
            </blockquote>
            <p className="text-muted-foreground leading-relaxed">
              Perspectiva is built for those who want certainty before
              commitment — connecting ideas to the people they are meant for.
            </p>
          </Card>
        </div>
      </div>
    </section>

    {/* thin separator */}
    <div aria-hidden="true" className="h-px bg-border/30 mx-8" />

    {/* ── Why it matters ───────────────────────────────────────── */}
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Why it{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              matters
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center mb-5 shadow-glow">
              <TrendingUp className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold mb-3">The problem</h3>
            <p className="text-muted-foreground leading-relaxed">
              Most products fail not because of bad execution, but because they
              were built without real demand. Perspectiva sits between ideation
              and execution — where the most important decisions are made.
            </p>
          </Card>

          <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-accent to-primary flex items-center justify-center mb-5 shadow-glow">
              <Target className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold mb-3">The goal</h3>
            <p className="text-muted-foreground leading-relaxed">
              Help people make better decisions earlier, reduce wasted time and
              cost, and build things that people actually want.
            </p>
          </Card>
        </div>

        <div className="text-center border-t border-border/50 pt-12">
          <p className="text-2xl font-semibold text-muted-foreground italic">
            &ldquo;Built for those who don&apos;t want to guess.&rdquo;
          </p>
        </div>
      </div>
    </section>
  </AppShell>
);

export default About;
