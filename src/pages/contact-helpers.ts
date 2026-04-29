import { z } from "zod";

// ── Types & constants ───────────────────────────────────────────

export type ContactRole = "founder" | "student" | "organisation" | "other";

export const ROLE_CONFIG: Record<
  ContactRole,
  { label: string; subjectTag: string }
> = {
  founder: { label: "Founder", subjectTag: "[Founder]" },
  student: { label: "Student", subjectTag: "[Student]" },
  organisation: { label: "Organisation", subjectTag: "[Organisation]" },
  other: { label: "Other", subjectTag: "[General]" },
};

export const ROLES = Object.keys(ROLE_CONFIG) as ContactRole[];

// ── Schema ──────────────────────────────────────────────────────

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  organisation: z.string().optional(),
  role: z.enum(["founder", "student", "organisation", "other"], {
    errorMap: () => ({ message: "Please select an option" }),
  }),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

// ── Helper ──────────────────────────────────────────────────────

export function buildContactMailto(data: ContactFormValues): string {
  const config = ROLE_CONFIG[data.role];
  const orgPart = data.organisation ? `\nOrganisation: ${data.organisation}` : "";
  const subject = encodeURIComponent(
    `${config.subjectTag} Message from ${data.name}`,
  );
  const body = encodeURIComponent(
    `Name: ${data.name}\nEmail: ${data.email}${orgPart}\nRole: ${config.label}\n\n${data.message}`,
  );
  return `mailto:hello@perspectiva.com?subject=${subject}&body=${body}`;
}
