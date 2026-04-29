import { Link } from "react-router-dom";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Database,
  Activity,
  Share2,
  UserCheck,
  Cpu,
  Globe,
  FileCheck,
  Mail,
} from "lucide-react";

/* ── Section data ────────────────────────────────────────────────── */

const SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    Icon: ShieldCheck,
    gradient: "from-primary to-accent",
    title: "Overview",
    body: (
      <>
        <p className="text-muted-foreground leading-relaxed mb-5">
          Perspectiva collects and processes data to match users with relevant
          surveys and generate meaningful insights for decision-making.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            "We do not sell personal data.",
            "We do not expose individual responses.",
            "All insights are anonymised and aggregated.",
          ].map((text) => (
            <div
              key={text}
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-muted/50 border border-border/40"
            >
              <ShieldCheck
                className="w-4 h-4 text-primary mt-0.5 flex-shrink-0"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "what-we-collect",
    label: "What We Collect",
    Icon: Database,
    gradient: "from-accent to-primary",
    title: "What Data We Collect",
    body: (
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            heading: "Account Information",
            items: ["Email address", "Name (optional)", "Age range", "Education or occupation"],
          },
          {
            heading: "Profile & Targeting",
            items: [
              "Interests and preferences",
              "High-level spending behaviour",
              "Optional demographic data",
            ],
          },
          {
            heading: "Response Data",
            items: ["Survey answers", "Time spent per question", "Completion behaviour"],
          },
        ].map(({ heading, items }) => (
          <div key={heading} className="p-4 rounded-xl bg-muted/40 border border-border/40">
            <p className="text-sm font-semibold text-foreground mb-2">{heading}</p>
            <ul className="space-y-1.5">
              {items.map((i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "how-we-use",
    label: "How It's Used",
    Icon: Activity,
    gradient: "from-primary to-accent",
    title: "How Your Data Is Used",
    body: (
      <>
        <ul className="space-y-3 mb-5">
          {[
            "Match you with relevant surveys",
            "Generate aggregated insights for survey creators",
            "Improve platform recommendations",
            "Maintain response quality and detect abuse",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <Activity className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span className="text-muted-foreground leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground p-3.5 rounded-xl bg-muted/40 border border-border/40">
          All survey outputs are anonymised. No individual user is identifiable in reports.
        </p>
      </>
    ),
  },
  {
    id: "data-sharing",
    label: "Data Sharing",
    Icon: Share2,
    gradient: "from-accent to-primary",
    title: "Data Sharing",
    body: (
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
          <p className="text-sm font-semibold text-foreground mb-3">
            We do <span className="text-destructive">not</span>:
          </p>
          <ul className="space-y-2">
            {[
              "Sell your personal data",
              "Share identifiable responses with companies",
              "Expose your identity to survey creators",
            ].map((i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0 mt-1.5" />
                {i}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-xl border border-success/20 bg-success/5">
          <p className="text-sm font-semibold text-foreground mb-3">
            We <span className="text-success">do</span>:
          </p>
          <ul className="space-y-2">
            {[
              "Share anonymised, aggregated insights",
              "Provide statistical outputs (averages, trends, patterns)",
            ].map((i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0 mt-1.5" />
                {i}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "your-rights",
    label: "Your Rights",
    Icon: UserCheck,
    gradient: "from-primary to-accent",
    title: "Your Rights",
    body: (
      <>
        <ul className="space-y-3 mb-5">
          {[
            "Access your personal data",
            "Request deletion of your account and data",
            "Opt out of optional data fields",
            "Stop using the platform at any time",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <UserCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span className="text-muted-foreground leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          To make a request,{" "}
          <Link to={ROUTES.contact} className="text-primary font-medium hover:underline">
            contact us
          </Link>{" "}
          or email{" "}
          <a href="mailto:hello@perspectiva.com" className="text-primary font-medium hover:underline">
            hello@perspectiva.com
          </a>
        </p>
      </>
    ),
  },
  {
    id: "ai-processing",
    label: "AI & Processing",
    Icon: Cpu,
    gradient: "from-accent to-primary",
    title: "AI & Data Processing",
    body: (
      <>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Perspectiva uses AI to analyse responses and generate insights.
        </p>
        <ul className="space-y-3">
          {[
            "AI is applied on anonymised or non-identifiable data where possible.",
            "Your data is not used to train external public AI systems.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <Cpu className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span className="text-muted-foreground leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    label: "Cookies",
    Icon: Globe,
    gradient: "from-primary to-accent",
    title: "Cookies & Tracking",
    body: (
      <>
        <ul className="space-y-3 mb-5">
          {[
            "Maintain login sessions",
            "Understand platform usage",
            "Improve performance",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <Globe className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span className="text-muted-foreground leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground p-3.5 rounded-xl bg-muted/40 border border-border/40">
          You may disable cookies in your browser, though some features may not function fully.
        </p>
      </>
    ),
  },
  {
    id: "compliance",
    label: "Compliance",
    Icon: FileCheck,
    gradient: "from-accent to-primary",
    title: "Compliance",
    body: (
      <>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Perspectiva operates in alignment with Personal Data Protection Act (PDPA) principles:
        </p>
        <ul className="space-y-3">
          {[
            "User consent before data collection",
            "Use of data only for stated purposes",
            "Reasonable protection of personal data",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <FileCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span className="text-muted-foreground leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    label: "Contact",
    Icon: Mail,
    gradient: "from-primary to-accent",
    title: "Contact",
    body: (
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-muted-foreground leading-relaxed flex-1">
          For privacy-related requests, reach us at{" "}
          <a href="mailto:hello@perspectiva.com" className="text-primary font-medium hover:underline">
            hello@perspectiva.com
          </a>
        </p>
        <Button asChild className="flex-shrink-0">
          <Link to={ROUTES.contact}>Contact us →</Link>
        </Button>
      </div>
    ),
  },
];

const SECTION_IDS = SECTIONS.map((s) => s.id);

/* ── Component ───────────────────────────────────────────────────── */

const Privacy = () => {
  const activeId = useScrollSpy(SECTION_IDS);

  return (
    <AppShell backgroundClassName="bg-background" mainClassName="static-page-main">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-subtle">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1.2s" }}
          />
        </div>
        <div className="container mx-auto px-4 pt-36 pb-20 relative z-10 static-fade-in">
          <h1 className="text-5xl lg:text-6xl font-bold mb-4">
            Privacy{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-2">
            How your data is collected, used, and protected on Perspectiva.
          </p>
          <p className="text-muted-foreground max-w-2xl">
            We are committed to handling your data responsibly, transparently, and with your consent.
          </p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-16 static-fade-in-delay">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-14 xl:gap-20 max-w-5xl mx-auto">

          {/* Sidebar TOC */}
          <aside className="hidden lg:block" aria-label="Table of contents">
            <div className="sticky top-24">
              <p className="text-eyebrow font-semibold uppercase tracking-widest text-muted-foreground mb-4 px-3">
                Contents
              </p>
              <nav className="policy-toc-nav">
                {SECTIONS.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={cn(
                      "policy-toc-link",
                      activeId === id && "policy-toc-link--active",
                    )}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Sections */}
          <main className="space-y-10 min-w-0">
            {SECTIONS.map(({ id, Icon, gradient, title, body }) => (
              <section key={id} id={id} aria-labelledby={`${id}-heading`}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-glow flex-shrink-0`}
                  >
                    <Icon className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <h2 id={`${id}-heading`} className="text-2xl font-bold">
                    {title}
                  </h2>
                </div>
                <Card className="p-6 border-border/50 bg-card/60 backdrop-blur">
                  {body}
                </Card>
              </section>
            ))}

            <div className="pt-4 border-t border-border/50">
              <p className="text-muted-foreground italic text-center">
                We believe meaningful insights should be built on trust, not exposure.
              </p>
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  );
};

export default Privacy;
