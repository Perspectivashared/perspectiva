import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SurveyPackage } from "@/lib/pricing-data";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronRight,
  Clock,
  MessageSquare,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

interface SurveyPackageCardProps {
  pkg: SurveyPackage;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const SurveyPackageCard = ({ pkg }: SurveyPackageCardProps) => {
  return (
    <Card
      className={cn(
        "relative flex flex-none flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all duration-200",
        pkg.recommended
          ? "w-[304px] border-primary/50 shadow-xl ring-1 ring-primary/20"
          : "w-72 hover:border-border/80 hover:shadow-md",
      )}
    >
      {/* Top accent strip — recommended only */}
      {pkg.recommended && (
        <div className="h-1.5 w-full flex-none bg-gradient-primary" />
      )}

      <div className="flex flex-1 flex-col p-6">
        {/* Recommended badge — top-right */}
        {pkg.recommended && (
          <Badge className="absolute right-4 top-5 bg-gradient-primary text-xs text-white">
            Most Popular
          </Badge>
        )}

        {/* Key upgrade callout */}
        {pkg.keyUpgrade && (
          <div className="mb-4 flex w-fit items-center gap-1.5 rounded bg-primary/8 px-2 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3 shrink-0" />
            {pkg.keyUpgrade}
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h3
            className={cn(
              "font-bold leading-tight tracking-tight",
              pkg.recommended ? "text-xl" : "text-lg",
            )}
          >
            {pkg.name}
          </h3>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-primary/80">
            {pkg.subtitle}
          </p>
          <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground/70">Best for</span>{" "}
            {pkg.bestFor}
          </p>
        </div>

        {/* Price */}
        <div className="mb-6">
          <span
            className={cn(
              "font-extrabold tracking-tight tabular-nums",
              pkg.recommended ? "text-5xl" : "text-4xl",
            )}
          >
            {currencyFormatter.format(pkg.price)}
          </span>
          <p className="mt-1.5 text-xs text-muted-foreground">one-time payment</p>
        </div>

        <Separator className="mb-6" />

        {/* Scope stats */}
        <div className="mb-5 space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs">
            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="font-semibold">{pkg.respondents}</span>
            <span className="text-muted-foreground">respondents</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="font-semibold">Up to {pkg.maxQuestions}</span>
            <span className="text-muted-foreground">questions</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs">
            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Delivered in</span>
            <span className="font-semibold">{pkg.duration}</span>
          </div>
        </div>

        {/* Audience pill */}
        <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5">
          <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-foreground/55">
              Audience
            </span>
            <span className="text-xs leading-relaxed text-foreground">
              {pkg.targetingDescription}
            </span>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Features */}
        <ul className="mb-6 flex-1 space-y-3">
          {pkg.features.map((feature) => {
            const isInheritance = feature.startsWith("Everything in");
            return (
              <li key={feature} className="flex items-start gap-2 text-xs leading-relaxed">
                {isInheritance ? (
                  <>
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                    <span className="italic text-muted-foreground">{feature}</span>
                  </>
                ) : (
                  <>
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="text-foreground/85">{feature}</span>
                  </>
                )}
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <div className="mt-auto space-y-2.5">
          <Button
            className={cn(
              "w-full font-semibold",
              pkg.recommended && "bg-gradient-primary shadow-elegant hover:shadow-glow",
            )}
            variant={pkg.recommended ? "default" : "outline"}
          >
            {pkg.ctaLabel}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{pkg.ctaMicrocopy}</p>
        </div>
      </div>
    </Card>
  );
};

export default SurveyPackageCard;
