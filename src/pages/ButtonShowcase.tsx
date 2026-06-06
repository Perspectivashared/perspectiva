import { Button } from "@/components/ui/button";
import { BUTTON_STYLES } from "@/lib/button-styles";
import {
  ArrowLeft,
  ArrowRight,
  Coins,
  Loader2,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
      {title}
    </h2>
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  </section>
);

const ButtonShowcase = () => {
  return (
    <div className="min-h-screen bg-background px-8 py-12">
      <div className="max-w-3xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Button Showcase</h1>
          <p className="text-muted-foreground mt-1 text-sm">All button variants &amp; styles — dev reference only</p>
        </div>

        {/* ── Base Variants ─────────────────────────────────────── */}
        <Section title="Base Variants">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </Section>

        {/* ── Sizes ─────────────────────────────────────────────── */}
        <Section title="Sizes — Default">
          <Button size="lg">Large</Button>
          <Button size="default">Default</Button>
          <Button size="sm">Small</Button>
          <Button size="icon"><Star className="h-4 w-4" /></Button>
        </Section>

        <Section title="Sizes — Outline">
          <Button variant="outline" size="lg">Large</Button>
          <Button variant="outline" size="default">Default</Button>
          <Button variant="outline" size="sm">Small</Button>
          <Button variant="outline" size="icon"><Star className="h-4 w-4" /></Button>
        </Section>

        {/* ── Amber / Buy Coins (className override) ────────────── */}
        <Section title="Amber Icon (Buy Coins — className override)">
          <Button
            size="icon"
            variant="outline"
            className={BUTTON_STYLES.coinIcon}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">coin action icon</span>
        </Section>

        {/* ── Success Outline (Community Join — joined state) ───── */}
        <Section title="Success Outline (Community Join — joined state)">
          <Button
            variant="outline"
            size="sm"
            className="border-success/35 bg-success/10 text-success shadow-none hover:border-success/50 hover:bg-success/15 hover:text-success"
          >
            Joined
          </Button>
        </Section>

        {/* ── Pricing Page Buttons ─────────────────────────────── */}
        <Section title="Pricing Page — Filled Actions">
          <Button size="lg" className={BUTTON_STYLES.primaryAction}>
            Compare Packages
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button className={BUTTON_STYLES.primaryAction}>
            Open Converter
          </Button>
        </Section>

        <Section title="Pricing Page — Quiet Outline Actions">
          <Button variant="outline" size="lg" className={BUTTON_STYLES.quietOutline}>
            Get Help Choosing
          </Button>
          <Button variant="outline" size="sm" className={BUTTON_STYLES.quietOutline}>
            View FAQ
          </Button>
          <Button variant="outline" size="sm" className={BUTTON_STYLES.quietOutline}>
            Contact us
          </Button>
        </Section>

        <Section title="Pricing Page — Carousel Controls">
          <Button
            variant="outline"
            size="icon"
            className={BUTTON_STYLES.quietIcon}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={BUTTON_STYLES.quietIcon}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Section>

        <Section title="Pricing Page — Package Selector">
          <button
            type="button"
            className={`${BUTTON_STYLES.selectorBase} ${BUTTON_STYLES.selectorActive}`}
          >
            Growth
          </button>
          <button
            type="button"
            className={`${BUTTON_STYLES.selectorBase} ${BUTTON_STYLES.selectorInactive}`}
          >
            Pro
          </button>
        </Section>

        <Section title="Pricing Page — Card CTAs">
          <div className="grid w-full gap-3 sm:grid-cols-2">
            <Button
              className={`${BUTTON_STYLES.cardBase} ${BUTTON_STYLES.cardPrimary}`}
            >
              Validate Your Market
            </Button>
            <Button
              variant="outline"
              className={`${BUTTON_STYLES.cardBase} ${BUTTON_STYLES.cardOutline}`}
            >
              Launch Pro Research
            </Button>
            <Button
              className={`${BUTTON_STYLES.cardBase} ${BUTTON_STYLES.coinPrimary}`}
            >
              Buy Bundle
            </Button>
            <Button
              variant="outline"
              disabled
              className={`${BUTTON_STYLES.cardBase} ${BUTTON_STYLES.cardOutline}`}
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Purchasing...
            </Button>
          </div>
        </Section>

        {/* ── Native HTML Collapsible Trigger (Profile / ForYou) ── */}
        <Section title="Native HTML Collapsible Trigger (Profile / ForYou)">
          <button className={`${BUTTON_STYLES.disclosure} group flex items-center justify-between`}>
            <span className="text-sm font-medium">Section Title</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </Section>

        {/* ── Disabled States ───────────────────────────────────── */}
        <Section title="Disabled States">
          <Button disabled>Default</Button>
          <Button variant="secondary" disabled>Secondary</Button>
          <Button variant="outline" disabled>Outline</Button>
          <Button variant="ghost" disabled>Ghost</Button>
          <Button variant="destructive" disabled>Destructive</Button>
        </Section>

        {/* ── With Icons ────────────────────────────────────────── */}
        <Section title="With Icons">
          <Button>
            <Plus className="h-4 w-4" /> Create Survey
          </Button>
          <Button variant="outline">
            <Coins className="h-4 w-4" /> Buy Coins
          </Button>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
          <Button variant="outline" size="icon">
            <Star className="h-4 w-4" />
          </Button>
        </Section>
      </div>
    </div>
  );
};

export default ButtonShowcase;
