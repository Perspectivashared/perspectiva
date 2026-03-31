import { useState } from "react";
import CoinBundleCard from "@/components/pricing/CoinBundleCard";
import RecurringPlanCard from "@/components/pricing/RecurringPlanCard";
import SectionHeading from "@/components/pricing/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BillingCycle, COIN_BUNDLES, RECURRING_PLANS } from "@/lib/pricing-data";
import { ROUTES } from "@/lib/routes";
import { ArrowRightLeft, Coins, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "@/shared/components/layout/AppShell";

const isBillingCycle = (value: string): value is BillingCycle =>
  value === "monthly" || value === "yearly";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <AppShell
      withContainer
      mainClassName="mx-auto max-w-6xl px-4 pb-12 pt-24"
      backgroundClassName="bg-gradient-subtle"
    >
        <header className="mb-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Flexible pricing for every stage
          </Badge>
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Pricing
            </span>{" "}
            & Coin Packages
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            Choose a recurring subscription or buy one-time coin bundles based
            on how often you create and run surveys.
          </p>
        </header>

        <section className="mb-12">
          <SectionHeading
            title="Recurring Payment Plans"
            description="Switch between monthly and yearly billing. Yearly plans include a discounted annual rate."
          />

          <Tabs
            value={billingCycle}
            onValueChange={(value) => {
              if (isBillingCycle(value)) {
                setBillingCycle(value);
              }
            }}
            className="mb-6"
          >
            <TabsList className="grid w-full max-w-sm grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {RECURRING_PLANS.map((plan) => (
              <RecurringPlanCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
              />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <SectionHeading
            title="One-Time Coin Purchase Options"
            description="Need coins right now? Buy a bundle anytime without changing your subscription."
          />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {COIN_BUNDLES.map((bundle) => (
              <CoinBundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </section>

        <section>
          <Card className="border-border/50 bg-card/60 p-6 backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Points and Coins Converter</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Quickly convert between your earned points and spendable coins.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
                  <CreditCard className="h-4 w-4" />
                  <Coins className="h-4 w-4 text-amber-600" />
                </div>
                <Button asChild>
                  <Link to={ROUTES.converter}>Open Converter</Link>
                </Button>
              </div>
            </div>
          </Card>
        </section>
    </AppShell>
  );
};

export default Pricing;
