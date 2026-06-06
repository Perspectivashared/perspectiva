import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES, LANDING_SECTION_IDS } from "@/lib/routes";
import FadeInView from "@/components/FadeInView";

const SurveyMockup = () => (
  <div className="relative">
    {/* Main card */}
    <div className="relative z-10 rounded-2xl border border-border/60 bg-card shadow-elegant overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-muted/40">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        </div>
        <div className="flex-1 mx-3 h-5 rounded-md bg-muted flex items-center px-2.5">
          <span className="text-[10px] text-muted-foreground/60 font-mono truncate">
            perspectiva.app/survey/…
          </span>
        </div>
      </div>

      {/* Survey content */}
      <div className="p-5">
        {/* Progress bar */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-primary rounded-full" />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">2 / 3</span>
        </div>

        {/* Question */}
        <p className="text-sm font-semibold text-foreground mb-3.5 leading-snug">
          How often do you participate in academic research surveys?
        </p>

        {/* Options */}
        <div className="space-y-2">
          {[
            { label: "Several times a week", selected: false },
            { label: "Once a week", selected: true },
            { label: "A few times a month", selected: false },
            { label: "Rarely", selected: false },
          ].map((opt) => (
            <div
              key={opt.label}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                opt.selected
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border/60 bg-muted/20 text-muted-foreground"
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  opt.selected ? "border-primary bg-primary" : "border-border"
                }`}
              >
                {opt.selected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
              <span>{opt.label}</span>
              {opt.selected && (
                <span className="ml-auto text-xs text-primary font-semibold">
                  +1 pt
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">R</span>
            </span>
            <span className="text-xs text-muted-foreground">Research</span>
          </div>
          <span className="text-xs font-semibold text-primary cursor-default">
            Next →
          </span>
        </div>
      </div>
    </div>

    {/* Floating badge: responses */}
    <div className="hero-badge--float-1 absolute -top-4 -right-4 z-20 px-3.5 py-2.5 rounded-xl border border-border/60 bg-card shadow-elegant">
      <p className="text-[10px] text-muted-foreground mb-0.5">Responses</p>
      <p className="text-xl font-bold tracking-tight text-foreground">47</p>
      <p className="text-[10px] text-success font-medium">↑ 12 this hour</p>
    </div>

    {/* Floating badge: completion */}
    <div className="hero-badge--float-2 absolute -bottom-4 -left-4 z-20 px-3.5 py-2.5 rounded-xl border border-border/60 bg-card shadow-elegant">
      <p className="text-[10px] text-muted-foreground mb-0.5">Completion rate</p>
      <p className="text-xl font-bold tracking-tight text-foreground">94%</p>
      <p className="text-[10px] text-muted-foreground">vs 45% avg</p>
    </div>
  </div>
);

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hero-orb hero-orb--1" />
        <div className="hero-orb hero-orb--2" />
        <div className="hero-orb hero-orb--3" />
        <div className="hero-grid-overlay" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <FadeInView className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/10 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                Gamified Research Platform
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-none text-foreground mb-6">
              Research that{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                rewards everyone
              </span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg mb-8">
              Join Perspectiva to collaborate with students and researchers
              worldwide. Take surveys to earn points, publish your research, and
              unlock AI‑powered analytics.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="h-12 px-8 font-semibold text-base">
                <Link to={ROUTES.signUp}>
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                <a href={`#${LANDING_SECTION_IDS.howItWorks}`}>See how it works</a>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              No credit card required · Free to join · Cancel anytime
            </p>
          </FadeInView>

          {/* Right: product mockup */}
          <FadeInView delay={0.15} className="hidden lg:block px-8 py-6">
            <SurveyMockup />
          </FadeInView>
        </div>
      </div>
    </section>
  );
};

export default Hero;
