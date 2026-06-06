import { Star } from "lucide-react";
import FadeInView from "@/components/FadeInView";

const testimonials = [
  {
    initials: "SM",
    name: "Sarah M.",
    role: "PhD Student, Psychology",
    quote:
      "I collected 60 responses in under 24 hours for my dissertation. The community targeting meant every respondent was actually relevant to my study — something generic tools could never give me.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    initials: "JK",
    name: "Dr. James K.",
    role: "Associate Professor, Economics",
    quote:
      "My students now use Perspectiva for every class research project. The points system gets people genuinely engaged rather than rushing through — response quality is noticeably higher.",
    color: "from-violet-500 to-purple-500",
  },
  {
    initials: "AR",
    name: "Alex R.",
    role: "Product Designer",
    quote:
      "I needed feedback from professionals in a specific field. Perspectiva's targeting got me exactly that in a day. The AI summary saved me hours of manual analysis on top of it.",
    color: "from-green-500 to-emerald-500",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background border-t border-border/50">
      <div className="container mx-auto px-4">
        <FadeInView>
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Testimonials
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              What researchers{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                are saying
              </span>
            </h2>
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col p-7 rounded-2xl border border-border/60 bg-card"
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
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-xs font-bold text-white">{t.initials}</span>
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
