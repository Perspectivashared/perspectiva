import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import FadeInView from "@/components/FadeInView";

const CtaBanner = () => {
  return (
    <section className="relative py-24">
      <div className="relative z-10 container mx-auto px-4">
        <FadeInView>
          <div className="glass-panel mx-auto max-w-3xl rounded-3xl px-8 py-16 text-center">
            <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--eyebrow-fg))]">
              Get started today
            </p>
            <h2 className="mb-6 font-display text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
              Ready to start your <span className="text-primary">research journey?</span>
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
