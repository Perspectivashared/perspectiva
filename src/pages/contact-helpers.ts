import { z } from "zod";

// ── Types & constants ───────────────────────────────────────────

export type ContactReason = "support" | "security" | "partnership" | "feedback";

export const REASON_CONFIG: Record<
  ContactReason,
  { label: string; recipient: string; subjectTag: string }
> = {
  support: {
    label: "Support",
    recipient: "support@perspectiva.com",
    subjectTag: "[Support]",
  },
  security: {
    label: "Security",
    recipient: "security@perspectiva.com",
    subjectTag: "[Security]",
  },
  partnership: {
    label: "Partnership",
    recipient: "support@perspectiva.com",
    subjectTag: "[Partnership]",
  },
  feedback: {
    label: "Feedback",
    recipient: "support@perspectiva.com",
    subjectTag: "[Feedback]",
  },
};

export const REASONS = Object.keys(REASON_CONFIG) as ContactReason[];

// ── Schema ──────────────────────────────────────────────────────

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  reason: z.enum(["support", "security", "partnership", "feedback"], {
    errorMap: () => ({ message: "Please select a reason" }),
  }),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

// ── Helper ──────────────────────────────────────────────────────

export function buildContactMailto(data: ContactFormValues): string {
  const config = REASON_CONFIG[data.reason];
  const subject = encodeURIComponent(
    `${config.subjectTag} Message from ${data.name}`,
  );
  const body = encodeURIComponent(
    `Name: ${data.name}\nEmail: ${data.email}\nReason: ${data.reason}\n\n${data.message}`,
  );
  return `mailto:${config.recipient}?subject=${subject}&body=${body}`;
}
