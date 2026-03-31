import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BillingCycle, RecurringPlan } from "@/lib/pricing-data";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface RecurringPlanCardProps {
  plan: RecurringPlan;
  billingCycle: BillingCycle;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const RecurringPlanCard = ({ plan, billingCycle }: RecurringPlanCardProps) => {
  const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const monthlyEquivalent = plan.yearlyPrice / 12;
  const yearlyDiscount = Math.round(
    ((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) * 100,
  );

  return (
    <Card
      className={cn(
        "relative h-full p-6 border-border/50 bg-card/50 backdrop-blur",
        plan.recommended ? "border-primary shadow-elegant" : "hover:shadow-elegant transition-all",
      )}
    >
      {plan.recommended ? (
        <Badge className="absolute -top-3 left-6 bg-gradient-primary text-white">
          Recommended
        </Badge>
      ) : null}

      <div className="mb-5">
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold">{currencyFormatter.format(price)}</span>
          <span className="pb-1 text-sm text-muted-foreground">
            / {billingCycle === "monthly" ? "month" : "year"}
          </span>
        </div>
        {billingCycle === "yearly" ? (
          <p className="mt-2 text-sm text-success">
            Save {yearlyDiscount}% • {currencyFormatter.format(monthlyEquivalent)} / month billed yearly
          </p>
        ) : null}
      </div>

      <ul className="mb-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full"
        variant={plan.recommended ? "default" : "outline"}
      >
        {plan.ctaLabel}
      </Button>
    </Card>
  );
};

export default RecurringPlanCard;
