import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck, HelpCircle } from "lucide-react";
import { AppShell } from "@/shared/components/layout/AppShell";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  contactSchema,
  buildContactMailto,
  ROLE_CONFIG,
  ROLES,
  type ContactRole,
  type ContactFormValues,
} from "./contact-helpers";

const Contact = () => {
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      organisation: "",
      role: undefined as unknown as ContactRole,
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    try {
      const mailto = buildContactMailto(data);
      window.open(mailto, "_self");
      toast({
        title: "Opening mail client",
        description: "Your message is ready to send.",
      });
    } catch {
      toast({
        title: "Could not open mail client",
        description: "Please email us directly at hello@perspectiva.com.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppShell
      backgroundClassName="contact-page-bg"
      mainClassName="contact-page-main"
    >
      <div className="contact-layout">
        {/* ── Left: hero + form ── */}
        <div className="contact-left">
          <header>
            <p className="contact-eyebrow">Get in touch</p>
            <h1 className="contact-heading">Let&apos;s talk.</h1>
            <p className="contact-subheading">
              Whether you&apos;re a founder, student, or organisation, we&apos;re
              open to collaborations, partnerships, and conversations.
            </p>
          </header>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="contact-form"
              noValidate
            >
              <div className="contact-form-row">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="contact-label">Full name</FormLabel>
                      <FormControl>
                        <Input
                          className="contact-input"
                          placeholder="Your name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="contact-label">
                        Email address
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="contact-input"
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="organisation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="contact-label">
                      Organisation{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="contact-input"
                        placeholder="Your company or school"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="contact-label">You are a</FormLabel>
                    <fieldset
                      className="contact-chips border-0 p-0 m-0"
                      aria-label="Select your role"
                    >
                      {ROLES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          aria-pressed={field.value === r}
                          className={cn(
                            "contact-chip",
                            field.value === r && "contact-chip--selected",
                          )}
                          onClick={() => field.onChange(r)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              field.onChange(r);
                            }
                          }}
                        >
                          {ROLE_CONFIG[r].label}
                        </button>
                      ))}
                    </fieldset>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="contact-label">Message</FormLabel>
                    <FormControl>
                      <Textarea
                        className="contact-input contact-textarea"
                        placeholder="Tell us what's on your mind…"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="self-start"
                disabled={form.formState.isSubmitting}
              >
                Send message →
              </Button>
            </form>
          </Form>
        </div>

        {/* ── Right: contact cards + FAQ ── */}
        <aside className="contact-right" aria-label="Contact information">
          <div className="contact-card">
            <Mail className="contact-card__icon-svg" aria-hidden="true" />
            <h3 className="contact-card__title">Direct Contact</h3>
            <p className="contact-card__desc">
              Collaborations, partnerships, and general enquiries.
            </p>
            <a
              href="mailto:hello@perspectiva.com"
              className="contact-card__link"
            >
              hello@perspectiva.com
            </a>
          </div>

          <div className="contact-card">
            <ShieldCheck
              className="contact-card__icon-svg"
              aria-hidden="true"
            />
            <h3 className="contact-card__title">Security</h3>
            <p className="contact-card__desc">
              Found a vulnerability? We take disclosures seriously.
            </p>
            <a
              href="mailto:hello@perspectiva.com"
              className="contact-card__link"
            >
              hello@perspectiva.com
            </a>
          </div>

          <div className="contact-faq-cta">
            <HelpCircle
              className="contact-card__icon-svg"
              aria-hidden="true"
            />
            <p className="contact-faq-cta__text">Looking for quick answers?</p>
            <Link to={ROUTES.faqs} className="contact-faq-cta__link">
              Browse the FAQs →
            </Link>
          </div>

          <p className="contact-response-time">
            We typically respond within 1–2 business days.
          </p>
        </aside>
      </div>
    </AppShell>
  );
};

export default Contact;
