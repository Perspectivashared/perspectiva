import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";
import { ArrowUp, Phone } from "lucide-react";
import { Instagram, Linkedin, Twitter, Youtube } from "@/components/BrandIcons";
import { useEffect, useRef, type ComponentType } from "react";
import { scrollToTop } from "@/lib/scroll";
import { Link } from "react-router-dom";

interface FooterLink {
  label: string;
  to: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterSocialLink {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

const footerSections: FooterSection[] = [
  {
    title: "Platform",
    links: [
      { label: "For You", to: ROUTES.forYou },
      { label: "Communities", to: ROUTES.communities },
{ label: "Profile", to: ROUTES.profile },
    ],
  },
  {
    title: "Build",
    links: [
      { label: "Create Survey", to: ROUTES.createSurvey },
      { label: "Pricing", to: ROUTES.pricing },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: ROUTES.about },
      { label: "Contact", to: ROUTES.contact },
      { label: "FAQs", to: ROUTES.faqs },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Security", to: ROUTES.security },
      { label: "Privacy", to: ROUTES.privacy },
      { label: "Terms", to: ROUTES.terms },
    ],
  },
];

const socialLinks: FooterSocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com", icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: Linkedin },
  { label: "YouTube", href: "https://www.youtube.com", icon: Youtube },
  { label: "X", href: "https://www.x.com", icon: Twitter },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--footer-reveal-progress", "1");
      return;
    }

    let rafId = 0;

    const updateRevealProgress = () => {
      const rect = el.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      const revealStart = viewportHeight * 0.98;
      const revealEnd = viewportHeight * 0.18;
      const rawProgress = (revealStart - rect.top) / (revealStart - revealEnd);
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));

      el.style.setProperty(
        "--footer-reveal-progress",
        clampedProgress.toFixed(3),
      );

      rafId = window.requestAnimationFrame(updateRevealProgress);
    };

    rafId = window.requestAnimationFrame(updateRevealProgress);

    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const handleBackToTop = () => scrollToTop();

  return (
    <footer ref={footerRef} className="footer-reveal relative overflow-hidden">
      <div className="container relative mx-auto px-4 py-14 sm:py-16">
        <div className="glass-panel rounded-4xl p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 border-b border-border/60 pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Link to={ROUTES.home} className="inline-flex items-center gap-3">
                <img
                  src={logo}
                  alt="Perspectiva Logo"
                  className="h-11 w-11 rounded-md"
                />
                <span className="text-xl font-semibold tracking-[0.12em] text-foreground">
                  PERSPECTIVA
                </span>
              </Link>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Collaborative Intelligence Platform
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map((socialLink) => {
                const Icon = socialLink.icon;

                return (
                  <a
                    key={socialLink.label}
                    href={socialLink.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={socialLink.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-primary/5 text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
              <Link
                to={ROUTES.contact}
                aria-label="Contact"
                title="Contact"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 bg-white/5 text-zinc-200 transition-all hover:border-cyan-300/70 hover:text-cyan-200"
              >
                <Phone className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-10 xl:grid-cols-[1.65fr_1fr]">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {footerSections.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((linkItem) => (
                      <li key={linkItem.to}>
                        <Link
                          to={linkItem.to}
                          className="footer-nav-link text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
                        >
                          {linkItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <section className="rounded-2xl border border-border/60 bg-primary/5 p-6">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--eyebrow-fg))]">
                Don't Miss A Beat
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-foreground">
                Get product updates first.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Monthly releases and useful resources.
              </p>
              <form
                className="mt-5 flex flex-col gap-3 sm:flex-row"
                onSubmit={(event) => event.preventDefault()}
              >
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <Input
                  id="footer-email"
                  type="email"
                  placeholder="Email address"
                  className="h-11"
                />
                <Button type="submit" className="h-11 px-6 font-semibold">
                  Submit
                </Button>
              </form>
            </section>
          </div>

          <div className="mt-10 border-t border-border/60 pt-6">
            <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
              <p className="max-w-2xl leading-relaxed text-muted-foreground">
                Need help getting started? Explore{" "}
                <Link
                  to={ROUTES.faqs}
                  className="font-medium text-foreground transition-colors hover:text-primary"
                >
                  FAQs
                </Link>{" "}
                or{" "}
                <Link
                  to={ROUTES.contact}
                  className="font-medium text-foreground transition-colors hover:text-primary"
                >
                  contact our team
                </Link>
                .
              </p>
              <button
                type="button"
                onClick={handleBackToTop}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-primary/5 px-4 py-2 font-medium text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
              >
                <ArrowUp className="h-4 w-4" />
                Back to top
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright &copy; {year} Perspectiva. All rights reserved.</p>
          <p>Built for curious teams across global communities.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
