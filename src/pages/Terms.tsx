import { Link } from "react-router-dom";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  FileText,
  Users,
  User,
  Globe,
  PenSquare,
  MessageSquare,
  CreditCard,
  Shield,
  Landmark,
  AlertCircle,
  XCircle,
  RefreshCw,
  Mail,
} from "lucide-react";

/* ── Section data ────────────────────────────────────────────────── */

const SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    Icon: FileText,
    gradient: "from-primary to-accent",
    title: "Overview",
    body: (
      <>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Perspectiva is a platform that connects survey creators with
          respondents to generate insights for decision-making.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          By accessing or using the platform, you agree to comply with these
          Terms of Service. If you do not agree, you should not use the
          platform.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    label: "Eligibility",
    Icon: Users,
    gradient: "from-accent to-primary",
    title: "Eligibility",
    body: (
      <>
        <p className="text-muted-foreground leading-relaxed mb-4">
          To use Perspectiva, you must:
        </p>
        <ul className="space-y-3 mb-5">
          {[
            "Be at least 13 years old",
            "Provide accurate information during registration",
            "Use the platform in compliance with applicable laws",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
              <span className="text-muted-foreground leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground p-3.5 rounded-xl bg-muted/40 border border-border/40">
          We reserve the right to suspend or remove accounts that provide false
          or misleading information.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    label: "User Accounts",
    Icon: User,
    gradient: "from-primary to-accent",
    title: "User Accounts",
    body: (
      <>
        <p className="text-muted-foreground leading-relaxed mb-4">
          You are responsible for:
        </p>
        <ul className="space-y-3 mb-5">
          {[
            "Maintaining the confidentiality of your account",
            "All activity conducted under your account",
            "Ensuring your login details are secure",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
              <span className="text-muted-foreground leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          We are not liable for losses resulting from unauthorised access due to
          user negligence.
        </p>
      </>
    ),
  },
  {
    id: "platform-use",
    label: "Platform Use",
    Icon: Globe,
    gradient: "from-accent to-primary",
    title: "Platform Use",
    body: (
      <>
        <p className="text-muted-foreground leading-relaxed mb-4">
          You agree not to:
        </p>
        <ul className="space-y-3 mb-5">
          {[
            "Submit false, misleading, or low-quality responses intentionally",
            "Use the platform for illegal or harmful purposes",
            "Attempt to exploit, manipulate, or abuse the reward system",
            "Interfere with platform operations or security",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0 mt-2" />
              <span className="text-muted-foreground leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          We reserve the right to suspend or terminate accounts that violate
          these rules.
        </p>
      </>
    ),
  },
  {
    id: "survey-creators",
    label: "Survey Creators",
    Icon: PenSquare,
    gradient: "from-primary to-accent",
    title: "Survey Creators",
    body: (
      <>
        <p className="text-muted-foreground leading-relaxed mb-4">
          If you create surveys on Perspectiva:
        </p>
        <ul className="space-y-3 mb-5">
          {[
            "You are responsible for the content of your surveys",
            "You must not collect sensitive or illegal data",
            "You must comply with applicable data protection laws",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
              <span className="text-muted-foreground leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          We reserve the right to remove surveys that violate platform
          guidelines.
        </p>
      </>
    ),
  },
  {
    id: "respondents",
    label: "Respondents",
    Icon: MessageSquare,
    gradient: "from-accent to-primary",
    title: "Respondents",
    body: (
      <>
        <ul className="space-y-3 mb-5">
          {[
            "You agree to provide honest and thoughtful responses",
            "Rewards may be adjusted or withheld for low-quality or fraudulent participation",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
              <span className="text-muted-foreground leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Important: </span>
            Partial responses may still be compensated proportionally based on
            progress.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "payments",
    label: "Payments & Rewards",
    Icon: CreditCard,
    gradient: "from-primary to-accent",
    title: "Payments & Rewards",
    body: (
      <>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Perspectiva operates a reward system that may include cash incentives,
          platform credits or coins, and other forms of compensation.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We reserve the right to:
        </p>
        <ul className="space-y-3 mb-5">
          {[
            "Adjust reward structures",
            "Set minimum withdrawal thresholds",
            "Withhold rewards in cases of abuse or fraud",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
              <span className="text-muted-foreground leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          All reward mechanisms are subject to change as the platform evolves.
        </p>
      </>
    ),
  },
  {
    id: "data-privacy",
    label: "Data & Privacy",
    Icon: Shield,
    gradient: "from-accent to-primary",
    title: "Data & Privacy",
    body: (
      <p className="text-muted-foreground leading-relaxed">
        Use of the platform is also governed by our Privacy Policy. By using
        Perspectiva, you consent to data collection and usage as described in
        the Privacy Policy.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    label: "Intellectual Property",
    Icon: Landmark,
    gradient: "from-primary to-accent",
    title: "Intellectual Property",
    body: (
      <p className="text-muted-foreground leading-relaxed">
        All platform content — including branding, design, technology, and
        analytics outputs — is owned by Perspectiva unless otherwise stated.
        Users may not copy, distribute, or reproduce platform materials without
        permission.
      </p>
    ),
  },
  {
    id: "liability",
    label: "Limitation of Liability",
    Icon: AlertCircle,
    gradient: "from-accent to-primary",
    title: "Limitation of Liability",
    body: (
      <>
        <ul className="space-y-3 mb-5">
          {[
            "We do not guarantee accuracy or business outcomes",
            "We are not liable for decisions made based on platform insights",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0 mt-2" />
              <span className="text-muted-foreground leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground p-3.5 rounded-xl bg-muted/40 border border-border/40">
          The platform is provided &ldquo;as is&rdquo; without warranties of
          any kind.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    label: "Termination",
    Icon: XCircle,
    gradient: "from-primary to-accent",
    title: "Termination",
    body: (
      <>
        <ul className="space-y-3 mb-5">
          {[
            "We reserve the right to suspend or terminate accounts at our discretion",
            "We may remove content that violates these terms",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
              <span className="text-muted-foreground leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          Users may stop using the platform at any time.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    label: "Changes to Terms",
    Icon: RefreshCw,
    gradient: "from-accent to-primary",
    title: "Changes to Terms",
    body: (
      <p className="text-muted-foreground leading-relaxed">
        We may update these Terms from time to time. Continued use of the
        platform after updates constitutes acceptance of the revised Terms.
      </p>
    ),
  },
  {
    id: "governing-law",
    label: "Governing Law",
    Icon: Globe,
    gradient: "from-primary to-accent",
    title: "Governing Law",
    body: (
      <p className="text-muted-foreground leading-relaxed">
        These Terms are governed by the laws of Singapore.
      </p>
    ),
  },
  {
    id: "contact",
    label: "Contact",
    Icon: Mail,
    gradient: "from-accent to-primary",
    title: "Contact",
    body: (
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-muted-foreground leading-relaxed flex-1">
          For questions regarding these Terms, reach us at{" "}
          <a
            href="mailto:hello@perspectiva.com"
            className="text-primary font-medium hover:underline"
          >
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

const Terms = () => {
  const activeId = useScrollSpy(SECTION_IDS);

  return (
    <AppShell backgroundClassName="bg-background" mainClassName="static-page-main">
      {/* ── Hero ───────────────────────────────────────────────── */}
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
            Terms of{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">Service</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-2">
            The rules and responsibilities for using Perspectiva.
          </p>
          <p className="text-muted-foreground max-w-2xl">
            By using Perspectiva, you agree to the following terms governing access, usage, and
            responsibilities on the platform.
          </p>
        </div>
      </section>

      {/* ── Content ────────────────────────────────────────────── */}
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
                Perspectiva is built to enable better decisions — these terms ensure the platform
                remains fair, secure, and reliable for everyone.
              </p>
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  );
};

export default Terms;
