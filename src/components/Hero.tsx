import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-subtle">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Gamified Research Platform
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Research Made{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Collaborative
              </span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              Join Perspectiva, where students and researchers exchange surveys,
              earn points, and gain insights through a gamified community-driven
              platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-primary shadow-elegant hover:shadow-glow transition-all"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  10K+
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Users
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  50K+
                </div>
                <div className="text-sm text-muted-foreground">
                  Surveys Completed
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  95%
                </div>
                <div className="text-sm text-muted-foreground">
                  Satisfaction Rate
                </div>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-elegant">
              <img
                src={heroImage}
                alt="Perspectiva Platform Visualization"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
