import { useEffect, useState } from "react";
import AddOnCard from "@/components/pricing/AddOnCard";
import CoinBundleCard from "@/components/pricing/CoinBundleCard";
import SectionHeading from "@/components/pricing/SectionHeading";
import SurveyPackageCard from "@/components/pricing/SurveyPackageCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ADD_ONS,
  COIN_BUNDLES,
  SURVEY_PACKAGES,
} from "@/features/pricing/domain/pricing-data";
import { BUTTON_STYLES } from "@/lib/button-styles";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { AppShell } from "@/shared/components/layout/AppShell";
import {
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Download,
  FileSpreadsheet,
  RefreshCw,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Pay once, own your results forever" },
  { icon: RefreshCw, label: "No subscription or auto-renewal" },
  { icon: Download, label: "Full CSV export on every plan" },
  { icon: Clock, label: "Results delivered in 1–7 days" },
] as const;

const HERO_STEPS = [
  {
    icon: Target,
    title: "Choose targeting depth",
    body: "Start broad, filter by demographics, or reach role-specific and senior audiences.",
  },
  {
    icon: Users,
    title: "Match scope to confidence",
    body: "Packages scale from 50 to 200 respondents and from 10 to 30 survey questions.",
  },
  {
    icon: FileSpreadsheet,
    title: "Keep every answer",
    body: "Every package includes response charts and exportable raw data for analysis.",
  },
] as const;

const FAQ_ITEMS = [
  {
    question: "Which package should I choose first?",
    answer:
      "Use Basic for broad idea checks, Starter for light demographic filters, and Growth when you need a real target market with AI Insights. Pro and Elite are better for decision-maker research, stakeholder reports, and hard-to-reach audiences.",
  },
  {
    question: "Can I increase reach without changing packages?",
    answer:
      "Yes. Optional Add-Ons let you add extra respondents, extra questions, faster delivery, a structured insight report, AI analysis, or priority processing.",
  },
  {
    question: "How do coins fit with survey packages?",
    answer:
      "Survey packages are one-time research purchases. Coin bundles are separate credits for platform features and future products, and coins never expire.",
  },
] as const;

const recommendedPackageIndex = Math.max(
  0,
  SURVEY_PACKAGES.findIndex((pkg) => pkg.recommended),
);

const Pricing = () => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(
    recommendedPackageIndex,
  );

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const syncSelectedPackage = () => {
      setSelectedPackageIndex(carouselApi.selectedScrollSnap());
    };

    syncSelectedPackage();
    carouselApi.on("select", syncSelectedPackage);
    carouselApi.on("reInit", syncSelectedPackage);

    return () => {
      carouselApi.off("select", syncSelectedPackage);
      carouselApi.off("reInit", syncSelectedPackage);
    };
  }, [carouselApi]);

  const selectedPackage =
    SURVEY_PACKAGES[selectedPackageIndex] ??
    SURVEY_PACKAGES[recommendedPackageIndex];

  return (
    <AppShell
      withContainer
      mainClassName="mx-auto max-w-screen-xl px-4 pb-20 pt-20 sm:px-6 lg:px-8"
      backgroundClassName="bg-gradient-subtle"
    >
      <header className="mb-12 border-b border-border/70 pb-10">
        <div className="max-w-4xl">
          <Badge className="mb-4 border-[hsl(195_85%_28%/0.25)] bg-[hsl(195_85%_28%/0.08)] px-3 py-1 text-[hsl(195_85%_28%)] dark:border-[hsl(195_85%_72%/0.25)] dark:bg-[hsl(195_85%_72%/0.12)] dark:text-[hsl(195_85%_72%)]">
            Pay once. No subscription.
          </Badge>
          <h1 className="text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Survey Packages & Pricing
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Commission a targeted survey, get results. Pick the package that
            matches your audience and timeline.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className={BUTTON_STYLES.primaryAction}>
              <a href="#packages">
                Compare Packages
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className={BUTTON_STYLES.quietOutline}
            >
              <Link to={ROUTES.contact}>Get Help Choosing</Link>
            </Button>
          </div>
        </div>

        <div className="mt-9 grid gap-6 md:grid-cols-3">
          {HERO_STEPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-3">
              <Icon className="mt-1 h-5 w-5 shrink-0 text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]" />
              <div>
                <p className="font-semibold leading-snug text-foreground">
                  {title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </header>

      <section
        className="mb-14 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground"
        aria-label="Pricing guarantees"
      >
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]" />
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section id="packages" className="mb-16 scroll-mt-24">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            align: "start",
            startIndex: recommendedPackageIndex,
          }}
        >
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="One-time research packages"
              title="Survey Packages"
              description="Five targeting tiers — from broad public feedback to hyper-niche expert panels. Each package is a single one-time purchase."
              className="mb-0"
            />

            <div className="flex items-center justify-between gap-3 lg:justify-end">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {selectedPackage.name}
                </span>{" "}
                tier {selectedPackageIndex + 1} of {SURVEY_PACKAGES.length}
              </div>
              <div className="flex gap-2">
                <CarouselPrevious
                  className={cn(
                    "static left-auto top-auto h-10 w-10 translate-y-0 rounded-md",
                    BUTTON_STYLES.quietOutline,
                  )}
                />
                <CarouselNext
                  className={cn(
                    "static right-auto top-auto h-10 w-10 translate-y-0 rounded-md",
                    BUTTON_STYLES.quietOutline,
                  )}
                />
              </div>
            </div>
          </div>

          <CarouselContent className="-ml-4 items-stretch px-6 py-5">
            {SURVEY_PACKAGES.map((pkg) => (
              <CarouselItem
                key={pkg.id}
                className="pl-4 md:basis-1/2 xl:basis-1/3"
              >
                <SurveyPackageCard pkg={pkg} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="mt-5 flex flex-wrap gap-2">
          {SURVEY_PACKAGES.map((pkg, index) => (
            <button
              key={pkg.id}
              type="button"
              className={cn(
                BUTTON_STYLES.selectorBase,
                index === selectedPackageIndex
                  ? BUTTON_STYLES.selectorActive
                  : BUTTON_STYLES.selectorInactive,
              )}
              onClick={() => carouselApi?.scrollTo(index)}
              aria-label={`Show ${pkg.name} package`}
              aria-pressed={index === selectedPackageIndex}
            >
              {pkg.name}
            </button>
          ))}
        </div>
      </section>

      <section id="compare" className="mb-16 scroll-mt-24">
        <SectionHeading
          eyebrow="Decision view"
          title="Compare the Details"
          description="The same packages, reorganized for scanning. Use this when you already know your audience and need the practical limits side by side."
        />

        <Card className="overflow-hidden border-border/80 bg-card shadow-sm">
          <div className="hidden lg:block">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="border-border/70 bg-muted/45 hover:bg-muted/45">
                  <TableHead className="w-[260px] font-semibold text-foreground">
                    Package
                  </TableHead>
                  <TableHead className="w-32 font-semibold text-foreground">
                    Price
                  </TableHead>
                  <TableHead className="w-[220px] font-semibold text-foreground">
                    Scope
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Targeting
                  </TableHead>
                  <TableHead className="w-36 font-semibold text-foreground">
                    Delivery
                  </TableHead>
                  <TableHead className="w-[210px] font-semibold text-foreground">
                    Upgrade
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SURVEY_PACKAGES.map((pkg) => (
                  <TableRow
                    key={pkg.id}
                    className={cn(
                      "border-border/70 hover:bg-muted/35",
                      pkg.recommended
                        ? "bg-[hsl(195_85%_30%/0.06)] hover:bg-[hsl(195_85%_30%/0.09)] dark:bg-[hsl(195_85%_72%/0.08)] dark:hover:bg-[hsl(195_85%_72%/0.11)]"
                        : "",
                    )}
                  >
                    <TableCell
                      className={cn(
                        "align-top",
                        pkg.recommended
                          ? "border-l-2 border-l-[hsl(195_85%_30%)] dark:border-l-[hsl(195_85%_72%)]"
                          : "border-l-2 border-l-transparent",
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-semibold text-foreground">
                            {pkg.name}
                          </span>
                          {pkg.recommended ? (
                            <Badge className="border-[hsl(195_85%_28%/0.25)] bg-[hsl(195_85%_28%/0.08)] text-[hsl(195_85%_28%)] dark:border-[hsl(195_85%_72%/0.25)] dark:bg-[hsl(195_85%_72%/0.12)] dark:text-[hsl(195_85%_72%)]">
                              Most Popular
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          {pkg.subtitle}
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {pkg.bestFor}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="font-semibold tabular-nums text-foreground">
                        {currencyFormatter.format(pkg.price)}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        one-time
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 shrink-0 text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]" />
                          <span className="font-medium text-foreground">
                            {pkg.respondents}
                          </span>
                          <span className="text-muted-foreground">
                            respondents
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 shrink-0 text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]" />
                          <span className="font-medium text-foreground">
                            {pkg.maxQuestions}
                          </span>
                          <span className="text-muted-foreground">
                            questions
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          <Target className="h-4 w-4 shrink-0 text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]" />
                          Level {pkg.targetingLevel}
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {pkg.targetingDescription}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Clock className="h-4 w-4 shrink-0 text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]" />
                        {pkg.duration}
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-sm leading-relaxed text-muted-foreground">
                      {pkg.keyUpgrade ?? "Core validation toolkit"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="divide-y divide-border/70 lg:hidden">
            {SURVEY_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  "p-5",
                  pkg.recommended
                    ? "border-l-2 border-l-[hsl(195_85%_30%)] bg-[hsl(195_85%_30%/0.06)] dark:border-l-[hsl(195_85%_72%)] dark:bg-[hsl(195_85%_72%/0.08)]"
                    : "",
                )}
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-normal text-foreground">
                        {pkg.name}
                      </h3>
                      {pkg.recommended ? (
                        <Badge className="border-[hsl(195_85%_28%/0.25)] bg-[hsl(195_85%_28%/0.08)] text-[hsl(195_85%_28%)] dark:border-[hsl(195_85%_72%/0.25)] dark:bg-[hsl(195_85%_72%/0.12)] dark:text-[hsl(195_85%_72%)]">
                          Most Popular
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {pkg.subtitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tabular-nums text-foreground">
                      {currencyFormatter.format(pkg.price)}
                    </p>
                    <p className="text-xs text-muted-foreground">one-time</p>
                  </div>
                </div>

                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {pkg.bestFor}
                </p>

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-md border border-border/70 bg-background/60 p-3">
                    <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                      <Users className="h-4 w-4 text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]" />
                      Scope
                    </div>
                    <p className="text-muted-foreground">
                      {pkg.respondents} respondents · {pkg.maxQuestions} questions
                    </p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background/60 p-3">
                    <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                      <Target className="h-4 w-4 text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]" />
                      Targeting
                    </div>
                    <p className="text-muted-foreground">
                      Level {pkg.targetingLevel} · {pkg.targetingDescription}
                    </p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background/60 p-3">
                    <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                      <Clock className="h-4 w-4 text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]" />
                      Delivery
                    </div>
                    <p className="text-muted-foreground">{pkg.duration}</p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background/60 p-3">
                    <div className="mb-2 font-medium text-foreground">
                      Upgrade
                    </div>
                    <p className="text-muted-foreground">
                      {pkg.keyUpgrade ?? "Core validation toolkit"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mb-16">
        <SectionHeading
          eyebrow="Customise scope"
          title="Optional Add-Ons"
          description="Stack upgrades onto any package — extra reach, richer analysis, or faster turnaround."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ADD_ONS.map((addon) => (
            <AddOnCard key={addon.id} addon={addon} />
          ))}
        </div>
      </section>

      <section className="mb-16 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/80 bg-card p-6 shadow-sm">
          <div className="flex h-full flex-col justify-between gap-6">
            <div>
              <p className="font-semibold text-foreground">
                Not sure which package fits your research?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Browse our FAQ for questions about targeting, turnaround times,
                and what's included in each tier.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                asChild
                className={BUTTON_STYLES.quietOutline}
              >
                <Link to={ROUTES.faqs}>View FAQ</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className={BUTTON_STYLES.quietOutline}
              >
                <Link to={ROUTES.contact}>Contact us</Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border-border/80 bg-card p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[hsl(142_76%_28%)] dark:text-[hsl(142_76%_62%)]" />
            <h2 className="text-xl font-semibold tracking-normal text-foreground">
              Fast Answers Before You Buy
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </section>

      <section className="mb-16">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Platform credits"
            title="Coin Bundles"
            description="Buy coins for platform features and future products. Coins never expire."
            className="mb-0"
          />
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge className="border-[hsl(32_95%_28%/0.25)] bg-[hsl(32_95%_28%/0.08)] text-[hsl(32_95%_28%)] dark:border-[hsl(38_92%_72%/0.25)] dark:bg-[hsl(38_92%_72%/0.12)] dark:text-[hsl(38_92%_72%)]">
              Coins never expire
            </Badge>
            <Badge className="border-[hsl(142_76%_28%/0.25)] bg-[hsl(142_76%_28%/0.10)] text-[hsl(142_76%_24%)] dark:border-[hsl(142_76%_62%/0.25)] dark:bg-[hsl(142_76%_62%/0.12)] dark:text-[hsl(142_76%_70%)]">
              Bonus coins on larger bundles
            </Badge>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COIN_BUNDLES.map((bundle) => (
            <CoinBundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      </section>

      <section>
        <Card className="overflow-hidden border-border/80 bg-card shadow-sm">
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                <ArrowRightLeft className="h-5 w-5 text-[hsl(195_85%_30%)] dark:text-[hsl(195_85%_72%)]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground">
                    Points and Coins Converter
                  </span>
                  <Badge className="border-[hsl(195_85%_28%/0.25)] bg-[hsl(195_85%_28%/0.08)] text-[hsl(195_85%_28%)] dark:border-[hsl(195_85%_72%/0.25)] dark:bg-[hsl(195_85%_72%/0.12)] dark:text-[hsl(195_85%_72%)]">
                    Utility
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Quickly convert between your earned points and spendable coins.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
                <CreditCard className="h-4 w-4" />
                <Coins className="h-4 w-4 text-[hsl(32_95%_30%)] dark:text-[hsl(38_92%_72%)]" />
              </div>
              <Button asChild className={BUTTON_STYLES.primaryAction}>
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
