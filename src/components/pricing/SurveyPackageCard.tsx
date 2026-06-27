import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BUTTON_STYLES } from "@/lib/button-styles";
import { SurveyPackage } from "@/features/pricing/domain/pricing-data";
import { cn } from "@/lib/utils";
import {
  Check,
  Clock,
  MessageSquare,
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
  const targetingDots = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <Card
      className={cn(
        "group relative flex h-full min-w-0 flex-col overflow-hidden border-border/80 bg-card shadow-xs transition-all duration-200 hover:border-foreground/25",
        pkg.recommended
          ? "border-2 border-[hsl(195_85%_30%/0.82)] shadow-[0_0_42px_-18px_hsl(195_85%_30%/0.62)] ring-1 ring-[hsl(195_85%_30%/0.24)] dark:border-[hsl(195_85%_72%/0.82)] dark:shadow-[0_0_42px_-18px_hsl(195_85%_72%/0.5)] dark:ring-[hsl(195_85%_72%/0.28)]"
          : "",
      )}
    >
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-5 flex min-h-12 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {pkg.subtitle}
            </p>
            <h3 className="mt-1 text-2xl font-semibold tracking-normal text-foreground">
              {pkg.name}
            </h3>
          </div>
          {pkg.recommended ? (
            <Badge className="shrink-0 border-[hsl(195_85%_28%/0.25)] bg-[hsl(195_85%_28%/0.08)] text-[hsl(195_85%_28%)] dark:border-[hsl(195_85%_72%/0.25)] dark:bg-[hsl(195_85%_72%/0.12)] dark:text-[hsl(195_85%_72%)]">
              Most Popular
            </Badge>
          ) : null}
        </div>

        <p className="mb-5 min-h-12 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Best for: </span>
          {pkg.bestFor}
        </p>

        <div className="mb-6">
          <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
            <span className="text-4xl font-bold tracking-normal text-foreground tabular-nums">
              {currencyFormatter.format(pkg.price)}
            </span>
            <span className="pb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              once
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">one-time payment</p>
        </div>

        <div className="mb-5 grid grid-cols-3 border-y border-border/70 py-4">
          <div className="border-r border-border/70 pr-3">
            <Users className="mb-2 h-4 w-4 text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]" />
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {pkg.respondents}
            </p>
            <p className="text-xs leading-tight text-muted-foreground">
              respondents
            </p>
          </div>
          <div className="border-r border-border/70 px-3">
            <MessageSquare className="mb-2 h-4 w-4 text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]" />
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {pkg.maxQuestions}
            </p>
            <p className="text-xs leading-tight text-muted-foreground">
              questions
            </p>
          </div>
          <div className="pl-3">
            <Clock className="mb-2 h-4 w-4 text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]" />
            <p className="text-sm font-semibold leading-tight text-foreground">
              {pkg.duration}
            </p>
            <p className="text-xs leading-tight text-muted-foreground">
              delivery
            </p>
          </div>
        </div>

        <div className="mb-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 shrink-0 text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Targeting Level {pkg.targetingLevel}
              </span>
            </div>
            <div
              className="flex gap-1"
              aria-label={`Targeting level ${pkg.targetingLevel} of 5`}
            >
              {targetingDots.map((dot) => (
                <span
                  key={dot}
                  className={cn(
                    "h-1.5 w-4 rounded-full",
                    dot <= pkg.targetingLevel
                      ? "bg-[hsl(195_85%_30%)] dark:bg-[hsl(195_85%_72%)]"
                      : "bg-border",
                  )}
                />
              ))}
            </div>
          </div>
          <p className="text-xs leading-relaxed text-foreground/85">
            {pkg.targetingDescription}
          </p>
        </div>

        {pkg.keyUpgrade ? (
          <div className="mb-5 rounded-md border border-border/70 bg-muted/40 px-3 py-2.5 text-xs font-semibold text-foreground">
            <span>{pkg.keyUpgrade}</span>
          </div>
        ) : null}

        <Separator className="mb-5" />

        <ul className="mb-5 flex-1 space-y-3">
          {pkg.features.map((feature) => {
            const isInheritance = feature.startsWith("Everything in");

            return (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-sm leading-relaxed"
              >
                <Check
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    isInheritance
                      ? "text-muted-foreground"
                      : "text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]",
                  )}
                />
                <span
                  className={cn(
                    isInheritance
                      ? "font-medium text-muted-foreground"
                      : "text-foreground/85",
                  )}
                >
                  {feature}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto space-y-2.5">
          <Button
            className={cn(
              BUTTON_STYLES.cardBase,
              pkg.recommended
                ? BUTTON_STYLES.cardPrimary
                : BUTTON_STYLES.cardOutline,
            )}
            variant={pkg.recommended ? "default" : "outline"}
          >
            {pkg.ctaLabel}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {pkg.ctaMicrocopy}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SurveyPackageCard;
