import { Star } from "lucide-react";
import FadeInView from "@/components/FadeInView";

const testimonials = [
  {
    initials: "SM",
    name: "Sarah M.",
    role: "PhD Student, Psychology",
    quote:
      "I collected 60 responses in under 24 hours for my dissertation. The community targeting meant every respondent was actually relevant to my study — something generic tools could never give me.",
  },
  {
    initials: "JK",
    name: "Dr. James K.",
    role: "Associate Professor, Economics",
    quote:
      "My students now use Perspectiva for every class research project. The points system gets people genuinely engaged rather than rushing through — response quality is noticeably higher.",
  },
  {
    initials: "AR",
    name: "Alex R.",
    role: "Product Designer",
    quote:
      "I needed feedback from professionals in a specific field. Perspectiva's targeting got me exactly that in a day. The AI summary saved me hours of manual analysis on top of it.",
  },
];

const Testimonials = () => {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-4">
        <FadeInView>
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--eyebrow-fg))]">
              Testimonials
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
              What researchers <span className="text-primary">are saying</span>
            </h2>
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="glass-panel flex flex-col rounded-2xl p-7"
              >
                <div className="flex gap-0.5 mb-5" aria-label="5 out of 5 stars">
                  {["s1", "s2", "s3", "s4", "s5"].map((id) => (
                    <Star key={id} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden />
                  ))}
                </div>

                <p className="text-sm text-foreground leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
                    <span className="font-mono text-xs font-bold text-primary">{t.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none mb-0.5">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeInView>
      </div>
    </section>
  );
};

export default Testimonials;
