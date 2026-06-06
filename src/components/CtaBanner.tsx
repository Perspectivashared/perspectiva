import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import FadeInView from "@/components/FadeInView";

const CtaBanner = () => {
  return (
    <section className="relative py-24 overflow-hidden border-t border-border/50">
      {/* Radial glow from top-centre, fading to background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,hsl(195_85%_45%/0.08),transparent)]"
      />
      <div className="relative z-10 container mx-auto px-4">
        <FadeInView>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              Get started today
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Ready to start your{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                research journey?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join thousands of students and researchers on Perspectiva.
            </p>
            <Button asChild size="lg" className="h-12 px-10 font-semibold text-base">
              <Link to={ROUTES.signUp}>
                Create your account
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required · Free to join · Cancel anytime
            </p>
          </div>
        </FadeInView>
      </div>
    </section>
  );
};

export default CtaBanner;
