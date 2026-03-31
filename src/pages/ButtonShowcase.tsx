import { Button } from "@/components/ui/button";
import { Plus, Star, Trash2, ArrowRight, Coins } from "lucide-react";

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
          <Button variant="default">Default (gradient)</Button>
          <Button variant="outline">Outline (primary tint)</Button>
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
            className="h-8 w-8 rounded-full border-amber-500/40 bg-amber-500/10 text-amber-700 hover:border-amber-500/70 hover:bg-amber-500/20 hover:text-amber-800 focus-visible:ring-amber-500/40 dark:text-amber-300 dark:hover:text-amber-200"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">rounded-full amber outline icon</span>
        </Section>

        {/* ── Success Outline (Community Join — joined state) ───── */}
        <Section title="Success Outline (Community Join — joined state)">
          <Button variant="outline" size="sm" className="border-success/40 text-success">
            Joined
          </Button>
        </Section>

        {/* ── Native HTML Collapsible Trigger (Profile / ForYou) ── */}
        <Section title="Native HTML Collapsible Trigger (Profile / ForYou)">
          <button className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur shadow-sm hover:bg-card/90 hover:border-border hover:shadow-elegant transition-all duration-200 group">
            <span className="text-sm font-medium">Section Title</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </Section>

        {/* ── Disabled States ───────────────────────────────────── */}
        <Section title="Disabled States">
          <Button disabled>Default</Button>
          <Button variant="outline" disabled>Outline</Button>
          <Button variant="outline" disabled>Outline</Button>
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
