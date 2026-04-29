import AddOnCard from "@/components/pricing/AddOnCard";
import CoinBundleCard from "@/components/pricing/CoinBundleCard";
import SectionHeading from "@/components/pricing/SectionHeading";
import SurveyPackageCard from "@/components/pricing/SurveyPackageCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ADD_ONS, COIN_BUNDLES, SURVEY_PACKAGES } from "@/lib/pricing-data";
import { ROUTES } from "@/lib/routes";
import {
  ArrowRightLeft,
  Clock,
  Coins,
  CreditCard,
  Download,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "@/shared/components/layout/AppShell";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Pay once, own your results forever" },
  { icon: RefreshCw, label: "No subscription or auto-renewal" },
  { icon: Download, label: "Full CSV export on every plan" },
  { icon: Clock, label: "Results delivered in 1–7 days" },
] as const;

const Pricing = () => {
  return (
    <AppShell
      withContainer
      mainClassName="mx-auto max-w-screen-xl px-4 pb-16 pt-20"
      backgroundClassName="bg-gradient-subtle"
    >
      {/* Hero */}
      <header className="mb-8">
        <Badge className="mb-3 border-primary/20 bg-primary/10 text-primary">
          Pay once. No subscription.
        </Badge>
        <h1 className="text-4xl font-bold">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Survey
          </span>{" "}
          Packages & Pricing
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Commission a targeted survey, get results. Pick the package that
          matches your audience and timeline.
        </p>
      </header>

      {/* Trust bar */}
      <div className="mb-12 flex flex-wrap gap-x-6 gap-y-2">
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4 shrink-0 text-primary/70" />
            {label}
          </div>
        ))}
      </div>

      {/* Survey packages */}
      <section className="mb-14">
        <SectionHeading
          title="Survey Packages"
          description="Five targeting tiers — from broad public feedback to hyper-niche expert panels. Each package is a single one-time purchase."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {SURVEY_PACKAGES.map((pkg) => (
            <SurveyPackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </section>

      {/* Add-ons */}
      <section className="mb-14">
        <SectionHeading
          title="Optional Add-Ons"
          description="Stack upgrades onto any package — extra reach, richer analysis, or faster turnaround."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ADD_ONS.map((addon) => (
            <AddOnCard key={addon.id} addon={addon} />
          ))}
        </div>
      </section>

      {/* FAQ callout */}
      <section className="mb-14">
        <Card className="border-border/40 bg-muted/20 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Not sure which package fits your research?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse our FAQ for questions about targeting, turnaround times,
                and what's included in each tier.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link to={ROUTES.faqs}>View FAQ</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.contact}>Contact us</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Coin bundles */}
      <section className="mb-14">
        <SectionHeading
          title="Coin Bundles"
          description="Buy coins for platform features and future products. Coins never expire."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {COIN_BUNDLES.map((bundle) => (
            <CoinBundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      </section>

      {/* Converter */}
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
