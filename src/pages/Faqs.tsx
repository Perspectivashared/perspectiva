import { useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Link } from "react-router-dom";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { ROUTES } from "@/lib/routes";
import { Search, ChevronDown, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Faq {
  q: string;
  /** Plain text — used for search matching */
  a: string;
  /** Optional rich version with inline links — rendered when available */
  aNode?: ReactNode;
}

interface Category {
  id: string;
  label: string;
  faqs: Faq[];
}

// ── Data ──────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: "getting-started",
    label: "Overview & Getting Started",
    faqs: [
      {
        q: "What is Perspectiva?",
        a: "Perspectiva is a decision-validation platform that helps founders and teams test ideas with real users before building. It provides structured surveys, targeted respondents, and analytics to support product, pricing, and positioning decisions.",
      },
      {
        q: "Is Perspectiva right for me?",
        a: "Perspectiva is designed for early-stage founders (pre-product market fit), student founders and startup teams, B2C, D2C, and SaaS companies targeting consumers, and anyone who needs real user feedback before launching a product.",
      },
      {
        q: "How is Perspectiva different from other survey tools?",
        a: "Perspectiva focuses on validation, not just data collection. You get a targeted, youth-heavy respondent base, incentivised responses for higher quality feedback, structured analytics and insights — not raw data — and faster turnaround for decision-making.",
      },
      {
        q: "Do I need any technical skills?",
        a: "No. The platform is designed to be simple and intuitive. You can create surveys and view insights without any technical background.",
      },
      {
        q: "How do I get started?",
        a: "Join the waitlist or sign up on the platform. Once approved, you can start creating surveys immediately.",
        aNode: (
          <>
            Join the waitlist or{" "}
            <Link
              to={ROUTES.signUp}
              className="text-primary underline-offset-2 hover:underline"
            >
              sign up on the platform
            </Link>
            . Once approved, you can start creating surveys immediately.
          </>
        ),
      },
    ],
  },
  {
    id: "running-surveys",
    label: "Running Surveys",
    faqs: [
      {
        q: "How do I create a survey?",
        a: "After signing up, you can create your survey directly on the platform, define your target audience, set your budget and incentives, then launch to start receiving responses.",
        aNode: (
          <>
            After signing up, you can{" "}
            <Link
              to={ROUTES.createSurvey}
              className="text-primary underline-offset-2 hover:underline"
            >
              create your survey
            </Link>{" "}
            directly on the platform, define your target audience, set your
            budget and incentives, then launch to start receiving responses.
          </>
        ),
      },
      {
        q: "Can I target specific users?",
        a: "Yes. You can define your audience based on age group, demographics, behavioural traits, and interests and spending patterns.",
      },
      {
        q: "How fast can I get results?",
        a: "Most surveys start receiving responses within hours after launch, depending on targeting and incentives. Full results typically come in within 24–72 hours.",
      },
      {
        q: "What kind of insights do I get?",
        a: "You receive structured dashboards, visualised data (charts and summaries), key insights and trends, and AI-generated recommendations for decision-making.",
      },
    ],
  },
  {
    id: "respondents",
    label: "Respondents & Quality",
    faqs: [
      {
        q: "Who answers the surveys?",
        a: "Surveys are answered by a panel of students and young consumers. All respondents go through profiling to improve relevance and targeting.",
      },
      {
        q: "How are respondents incentivised?",
        a: "Respondents earn rewards in the form of points and coins. These can be accumulated and converted into cash, vouchers, or other rewards based on platform thresholds.",
      },
      {
        q: "Do respondents get paid for partial answers?",
        a: "Yes. Rewards can be distributed proportionally based on how many questions are completed. Partial responses are still captured and analysed.",
      },
      {
        q: "How do you prevent low-quality or fake responses?",
        a: "Perspectiva uses minimum response requirements, AI-assisted validation, response rating systems, and profiling and behaviour tracking. Low-quality or spam responses are filtered out.",
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing & Use Cases",
    faqs: [
      {
        q: "How much does it cost?",
        a: "Pricing depends on number of responses, targeting specificity, and incentive levels. You can start with smaller budgets and scale based on your needs.",
        aNode: (
          <>
            Pricing depends on number of responses, targeting specificity, and
            incentive levels. Visit our{" "}
            <Link
              to={ROUTES.pricing}
              className="text-primary underline-offset-2 hover:underline"
            >
              pricing page
            </Link>{" "}
            to find a plan that fits your needs.
          </>
        ),
      },
      {
        q: "Can students or researchers use Perspectiva?",
        a: "Yes. The platform is open to students and individuals running research, projects, or idea validation.",
      },
      {
        q: "What do I do with my results?",
        a: "You can refine your idea or product, adjust pricing or positioning, validate assumptions before building, and use insights in investor or pitch decks.",
      },
    ],
  },
  {
    id: "data-privacy",
    label: "Data & Privacy",
    faqs: [
      {
        q: "Is my data secure?",
        a: "Yes. All data is handled securely and in compliance with relevant data protection regulations. Your survey responses and insights remain private.",
        aNode: (
          <>
            Yes. All data is handled securely and in compliance with our{" "}
            <Link
              to={ROUTES.privacy}
              className="text-primary underline-offset-2 hover:underline"
            >
              privacy policy
            </Link>
            . Your survey responses and insights remain private.
          </>
        ),
      },
      {
        q: "Can I export my data?",
        a: "Yes. You can export survey results and insights for use in reports, presentations, or further analysis.",
      },
    ],
  },
];

const MOST_ASKED_KEYS = [
  "How is Perspectiva different from other survey tools?",
  "How much does it cost?",
  "How fast can I get results?",
  "How do I get started?",
];

const ALL_FAQS = CATEGORIES.flatMap((c) => c.faqs);
const FAQ_BY_KEY = new Map(ALL_FAQS.map((f) => [f.q, f]));
const MOST_ASKED = MOST_ASKED_KEYS.map((k) => FAQ_BY_KEY.get(k)!);
const ALL_KEYS = ALL_FAQS.map((f) => f.q);
const TOTAL = ALL_FAQS.length;
const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

// ── Utility ───────────────────────────────────────────────────────────────────

function highlightText(text: string, query: string): ReactNode {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        className="bg-primary/25 text-foreground rounded-sm px-0.5 not-italic"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// ── FaqItem ───────────────────────────────────────────────────────────────────

interface FaqItemProps {
  faq: Faq;
  idx: number;
  isOpen: boolean;
  chevronDeg: number;
  onToggle: () => void;
  searchQuery: string;
}

const FaqItem = ({
  faq,
  idx,
  isOpen,
  chevronDeg,
  onToggle,
  searchQuery,
}: FaqItemProps) => {
  const answerId = `faq-answer-${idx}`;
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div
        className={cn(
          "rounded-xl border backdrop-blur-sm transition-colors duration-200",
          isOpen
            ? "border-primary/30 bg-card/80"
            : "border-border/50 bg-card/50 hover:border-border/80"
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={answerId}
            className="w-full flex items-center justify-between px-5 py-4 group hover:bg-accent/10 active:bg-accent/15 rounded-xl transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-inset"
          >
            <div className="flex items-center gap-4 text-left">
              <span
                className="text-[11px] font-mono text-muted-foreground/50 shrink-0 w-5 tabular-nums select-none"
                aria-hidden="true"
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="font-semibold text-[17px] leading-snug text-foreground group-hover:text-primary transition-colors duration-150">
                {searchQuery ? highlightText(faq.q, searchQuery) : faq.q}
              </span>
            </div>
            <ChevronDown
              className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-4 transition-transform duration-300"
              style={{ transform: `rotate(${chevronDeg}deg)` }}
              aria-hidden="true"
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="collapsible-animate">
          <div
            id={answerId}
            role="region"
            aria-label={faq.q}
            className="px-5 pb-5 pt-1 pl-15 text-[14px] leading-survey text-muted-foreground"
          >
            {faq.aNode ?? faq.a}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const Faqs = () => {
  const { isAuthenticated } = useAuth();
  const [openSet, setOpenSet] = useState<Set<string>>(new Set());
  const [chevronMap, setChevronMap] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const activeId = useScrollSpy(CATEGORY_IDS);

  // ── Toggle individual ──────────────────────────────────────────────────────

  const toggle = (q: string) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(q)) next.delete(q);
      else next.add(q);
      return next;
    });
    setChevronMap((prev) => ({ ...prev, [q]: (prev[q] ?? 0) + 180 }));
  };

  // ── Expand / collapse all ──────────────────────────────────────────────────

  const allOpen = ALL_KEYS.length > 0 && ALL_KEYS.every((k) => openSet.has(k));

  const toggleAll = () => {
    const updates: Record<string, number> = {};
    if (allOpen) {
      ALL_KEYS.forEach((k) => {
        if (openSet.has(k)) updates[k] = (chevronMap[k] ?? 0) + 180;
      });
      setOpenSet(new Set());
    } else {
      ALL_KEYS.forEach((k) => {
        if (!openSet.has(k)) updates[k] = (chevronMap[k] ?? 0) + 180;
      });
      setOpenSet(new Set(ALL_KEYS));
    }
    setChevronMap((prev) => ({ ...prev, ...updates }));
  };

  // ── Search ─────────────────────────────────────────────────────────────────

  const searchQuery = search.trim().toLowerCase();
  const filteredFaqs = searchQuery
    ? ALL_FAQS.filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery) ||
          f.a.toLowerCase().includes(searchQuery)
      )
    : null;

  const scrollToCategory = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Item prop builder ──────────────────────────────────────────────────────

  const itemProps = (faq: Faq, idx: number): FaqItemProps => ({
    faq,
    idx,
    isOpen: openSet.has(faq.q),
    chevronDeg: chevronMap[faq.q] ?? 0,
    onToggle: () => toggle(faq.q),
    searchQuery: search.trim(),
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AppShell backgroundClassName="bg-background" mainClassName="static-page-main">
      {/* Skip link */}
      <a
        href="#faq-list"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to FAQ
      </a>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-subtle">
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>
        <div className="container mx-auto px-4 pt-36 pb-20 relative z-10 static-fade-in">
          <div className="max-w-[1100px] mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold mb-4">
              Got questions?{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                We've got answers.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Answers to help you decide and get started faster.
            </p>
          </div>
        </div>
      </section>

      {/* ── Search + main layout ───────────────────────────────────────────────── */}
      <section
        id="faq-list"
        className="py-12 bg-background"
      >
        <div className="container mx-auto px-4 max-w-[1100px]">

          {/* Search bar */}
          <div className="relative mb-8 static-fade-in-delay">
            <label htmlFor="faq-search" className="sr-only">
              Search FAQs
            </label>
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="faq-search"
              type="search"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-16 py-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm text-sm placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all duration-200"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category chips — visible on mobile, hidden on desktop */}
          {!searchQuery && (
            <div
              role="group"
              aria-label="Filter by category"
              className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none lg:hidden"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => scrollToCategory(cat.id)}
                  className={cn(
                    "shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border shadow-xs transition-all duration-150 whitespace-nowrap focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
                    activeId === cat.id
                      ? "border-primary/50 bg-gradient-primary text-primary-foreground"
                      : "border-border/60 bg-transparent text-muted-foreground hover:border-primary/60 hover:bg-primary/8 hover:text-primary"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Two-column layout */}
          <div className="flex gap-10 static-fade-in-delay">

            {/* ── Left sticky nav — desktop only ──────────────────────────────── */}
            {!searchQuery && (
              <aside className="hidden lg:block w-[220px] shrink-0" aria-label="Table of contents">
                <div className="sticky top-24">
                  <p className="text-eyebrow font-semibold uppercase tracking-widest text-muted-foreground mb-4 px-3">
                    Contents
                  </p>
                  <nav className="policy-toc-nav">
                    {CATEGORIES.map((cat) => (
                      <a
                        key={cat.id}
                        href={`#${cat.id}`}
                        onClick={(e) => { e.preventDefault(); scrollToCategory(cat.id); }}
                        className={cn("policy-toc-link", activeId === cat.id && "policy-toc-link--active")}
                      >
                        {cat.label}
                      </a>
                    ))}
                  </nav>

                  <div className="pt-5 mt-3 border-t border-border/40 px-1">
                    <p className="text-xs text-muted-foreground mb-3 px-2">
                      Still need help?
                    </p>
                    <Button asChild size="sm" variant="outline" className="w-full text-xs">
                      <Link to={ROUTES.contact}>Contact us</Link>
                    </Button>
                  </div>
                </div>
              </aside>
            )}

            {/* ── Right content ────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 space-y-10">

              {/* Expand all / stats row */}
              {!searchQuery && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{TOTAL}</span>{" "}
                    questions across{" "}
                    <span className="font-medium text-foreground">
                      {CATEGORIES.length}
                    </span>{" "}
                    categories
                  </p>
                  <button
                    onClick={toggleAll}
                    className="text-sm text-primary hover:text-primary/80 transition-colors font-medium focus-visible:outline-hidden focus-visible:underline"
                  >
                    {allOpen ? "Close all" : "Open all answers"}
                  </button>
                </div>
              )}

              {/* ── Search results ─────────────────────────────────────────────── */}
              {searchQuery && (
                <div className="space-y-3">
                  {filteredFaqs!.length > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">
                        {filteredFaqs!.length} result
                        {filteredFaqs!.length !== 1 ? "s" : ""} for{" "}
                        <span className="font-medium text-foreground">
                          "{search.trim()}"
                        </span>
                      </p>
                      {filteredFaqs!.map((faq, idx) => (
                        <FaqItem key={faq.q} {...itemProps(faq, idx)} />
                      ))}
                    </>
                  ) : (
                    <div className="py-16 text-center space-y-3">
                      <p className="font-semibold text-foreground text-lg">
                        No results for "{search.trim()}"
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Try:{" "}
                        {["pricing", "security", "results"].map((term, i) => (
                          <span key={term}>
                            {i > 0 && ", "}
                            <button
                              onClick={() => setSearch(term)}
                              className="text-primary hover:underline underline-offset-2"
                            >
                              {term}
                            </button>
                          </span>
                        ))}
                      </p>
                      <Button asChild variant="outline" size="sm" className="mt-2">
                        <Link to={ROUTES.contact}>Contact our team →</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Most Asked ─────────────────────────────────────────────────── */}
              {!searchQuery && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Star
                        className="w-3.5 h-3.5 text-primary fill-primary"
                        aria-hidden="true"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                        Most Asked
                      </span>
                    </div>
                    <div className="space-y-2">
                      {MOST_ASKED.map((faq, idx) => (
                        <FaqItem key={`most-${faq.q}`} {...itemProps(faq, idx)} />
                      ))}
                    </div>
                  </div>

                  {/* ── Category sections ──────────────────────────────────────── */}
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      id={cat.id}
                    >
                      <div className="mb-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                          {cat.label}
                        </h2>
                      </div>
                      <div className="space-y-2">
                        {cat.faqs.map((faq, idx) => (
                          <FaqItem key={faq.q} {...itemProps(faq, idx)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <h2 className="text-2xl font-bold mb-3">
            Didn't find what you were looking for?
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Our team typically responds within a few hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="font-semibold">
              <Link to={ROUTES.contact}>Contact us →</Link>
            </Button>
            {!isAuthenticated && (
              <Button asChild size="lg" variant="outline" className="font-semibold">
                <Link to={ROUTES.signUp}>Try Perspectiva free →</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
};

export default Faqs;
