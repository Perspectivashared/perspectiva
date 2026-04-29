import { Link } from "react-router-dom";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import {
  Shield,
  Server,
  Lock,
  KeyRound,
  ShieldAlert,
  Cpu,
  AlertTriangle,
  User,
  RefreshCw,
  Mail,
} from "lucide-react";

const FEATURES = [
  {
    icon: Server,
    gradient: "from-primary to-accent",
    title: "Infrastructure Security",
    items: [
      "Controlled access environments",
      "Regular system monitoring",
      "Scalable and isolated hosting",
    ],
    note: "Only authorised personnel have access to critical systems.",
  },
  {
    icon: Lock,
    gradient: "from-accent to-primary",
    title: "Data Protection",
    items: [
      "Encryption during transmission",
      "Secure storage practices",
      "Restricted internal access controls",
    ],
    note: "We minimise personally identifiable data stored wherever possible.",
  },
  {
    icon: KeyRound,
    gradient: "from-primary to-accent",
    title: "Access Control",
    items: [
      "Role-based permissions for internal systems",
      "Limited access to user data",
      "Authentication controls for platform users",
    ],
    note: null,
  },
  {
    icon: ShieldAlert,
    gradient: "from-accent to-primary",
    title: "Platform Integrity",
    items: [
      "Detection systems for spam or fraudulent responses",
      "Monitoring of unusual activity patterns",
      "Response validation mechanisms",
    ],
    note: "Ensures both users and creators receive reliable data.",
  },
  {
    icon: Cpu,
    gradient: "from-primary to-accent",
    title: "AI & System Security",
    items: [
      "Processing of anonymised data where possible",
      "No external exposure of raw user data",
      "Controlled integration with analytics systems",
    ],
    note: null,
  },
  {
    icon: AlertTriangle,
    gradient: "from-accent to-primary",
    title: "Incident Response",
    items: [
      "Investigate and contain the incident",
      "Notify affected users if required",
      "Take corrective action to prevent recurrence",
    ],
    note: null,
  },
  {
    icon: User,
    gradient: "from-primary to-accent",
    title: "User Responsibility",
    items: [
      "Keep login credentials secure",
      "Do not share accounts",
      "Report suspicious activity",
    ],
    note: null,
  },
  {
    icon: RefreshCw,
    gradient: "from-accent to-primary",
    title: "Continuous Improvement",
    items: [
      "Security is continuously reviewed as the platform scales",
      "Proactive assessment of emerging threats",
      "Regular internal audits and access reviews",
    ],
    note: null,
  },
];

const Security = () => (
  <AppShell backgroundClassName="bg-background" mainClassName="static-page-main">
    {/* ── Hero ─────────────────────────────────────────────────── */}
    <section className="relative overflow-hidden bg-gradient-subtle">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>
      <div className="container mx-auto px-4 pt-36 pb-20 relative z-10 static-fade-in">
        <h1 className="text-5xl lg:text-6xl font-bold mb-4">
          <span className="bg-gradient-primary bg-clip-text text-transparent">Security</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-2">
          How we protect your data, platform, and transactions.
        </p>
        <p className="text-muted-foreground max-w-2xl">
          Security is built into Perspectiva from infrastructure to product design.
        </p>
      </div>
    </section>

    {/* ── Overview ─────────────────────────────────────────────── */}
    <section className="py-14 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="p-8 border-primary/20 bg-card/60 backdrop-blur shadow-elegant">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
              <Shield className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                Perspectiva is designed with security as a core layer, ensuring that user data,
                survey responses, and platform operations are protected against unauthorised access
                and misuse. Every layer of the platform — from infrastructure to AI systems — is
                built with this in mind.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>

    {/* ── Feature grid ─────────────────────────────────────────── */}
    <section className="pb-16 bg-background">
      <div className="container mx-auto px-4">
        {/* All 8 feature cards + 1 contact card in a uniform grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto static-fade-in-delay">
          {FEATURES.map(({ icon: Icon, gradient, title, items, note }) => (
            <Card
              key={title}
              className="p-6 hover:shadow-elegant transition-all duration-300 border-border/50 bg-card/50 backdrop-blur flex flex-col"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-glow`}
              >
                <Icon className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold mb-3">{title}</h3>
              <ul className="space-y-2 flex-1">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              {note && (
                <p className="text-xs text-muted-foreground/80 pt-3 mt-3 border-t border-border/40 leading-relaxed">
                  {note}
                </p>
              )}
            </Card>
          ))}

          {/* Contact card — same card shell as every feature card above */}
          <Card className="p-6 hover:shadow-elegant transition-all duration-300 border-border/50 bg-card/50 backdrop-blur flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 shadow-glow">
              <Mail className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold mb-3">Contact</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              For security concerns or vulnerability reports, reach out directly at{" "}
              <a
                href="mailto:hello@perspectiva.com"
                className="text-primary hover:underline"
              >
                hello@perspectiva.com
              </a>
            </p>
            <Button asChild className="mt-4 self-start">
              <Link to={ROUTES.contact}>Open contact form →</Link>
            </Button>
          </Card>
        </div>
      </div>
    </section>

    {/* ── Last line ────────────────────────────────────────────── */}
    <section className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4 text-center">
        <p className="text-2xl font-semibold text-muted-foreground italic max-w-2xl mx-auto">
          &ldquo;Trust is not claimed. It is built through how data is protected every day.&rdquo;
        </p>
      </div>
    </section>
  </AppShell>
);

export default Security;
