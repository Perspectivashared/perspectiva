/**
 * Typography system for Perspectiva.
 *
 * Design principles:
 * - Body / UI chrome  → Plus Jakarta Sans (font-sans)
 * - Headings          → Space Grotesk     (font-display)
 * - Data / analytics  → JetBrains Mono   (font-mono)
 *
 * Use these components instead of raw Tailwind heading / text utilities
 * so that font choices, sizes, and spacing stay consistent site-wide.
 */

import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

// ─── Polymorphic base ──────────────────────────────────────────────────────

type AsProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

// ─── Heading components ────────────────────────────────────────────────────

/**
 * H1 — Page title. Space Grotesk 700. Fluid: 36–60px.
 * Reserve for one-per-page landmark headings only.
 */
export function H1({ className, children, ...props }: AsProps<"h1">) {
  return (
    <h1
      className={cn(
        "font-display font-bold tracking-tighter",
        "text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05]",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

/**
 * H2 — Section heading. Space Grotesk 700. Fluid: 30–40px.
 */
export function H2({ className, children, ...props }: AsProps<"h2">) {
  return (
    <h2
      className={cn(
        "font-display font-bold tracking-tight",
        "text-[clamp(1.875rem,3.5vw,2.5rem)] leading-[1.1]",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

/**
 * H3 — Sub-section heading. Space Grotesk 600. Fluid: 22–30px.
 */
export function H3({ className, children, ...props }: AsProps<"h3">) {
  return (
    <h3
      className={cn(
        "font-display font-semibold tracking-snug",
        "text-[clamp(1.375rem,2.5vw,1.875rem)] leading-tight",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

/**
 * H4 — Card headings, sidebar sections. Space Grotesk 600. 20px fixed.
 */
export function H4({ className, children, ...props }: AsProps<"h4">) {
  return (
    <h4
      className={cn(
        "font-display font-semibold text-xl leading-snug tracking-snug",
        className,
      )}
      {...props}
    >
      {children}
    </h4>
  );
}

// ─── Body text components ──────────────────────────────────────────────────

/**
 * Body — Standard prose. Plus Jakarta Sans 400. 16px / lh 1.625.
 * Default element is <p>; use `as` to change (e.g. `as="span"`).
 */
export function Body<T extends ElementType = "p">({
  as,
  className,
  children,
  ...props
}: AsProps<T>) {
  const Tag = as ?? "p";
  return (
    <Tag
      className={cn(
        "font-sans text-base leading-relaxed text-foreground",
        className,
      )}
      {...(props as object)}
    >
      {children}
    </Tag>
  );
}

/**
 * BodyMuted — Secondary prose. Muted foreground colour.
 */
export function BodyMuted<T extends ElementType = "p">({
  as,
  className,
  children,
  ...props
}: AsProps<T>) {
  const Tag = as ?? "p";
  return (
    <Tag
      className={cn(
        "font-sans text-base leading-relaxed text-muted-foreground",
        className,
      )}
      {...(props as object)}
    >
      {children}
    </Tag>
  );
}

/**
 * Small — Secondary info, metadata, timestamps. 14px.
 */
export function Small({ className, children, ...props }: AsProps<"p">) {
  return (
    <p
      className={cn(
        "font-sans text-sm leading-normal text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

/**
 * Caption — Tertiary labels, image captions. 12px.
 * WCAG: only use on non-essential decorative content; don't use for errors.
 */
export function Caption({ className, children, ...props }: AsProps<"span">) {
  return (
    <span
      className={cn(
        "font-sans text-xs leading-normal tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ─── UI-specific components ────────────────────────────────────────────────

/**
 * Eyebrow — All-caps section labels above headings.
 * Example: "RESEARCH TOOLS" above an H2.
 */
export function Eyebrow({ className, children, ...props }: AsProps<"span">) {
  return (
    <span
      className={cn(
        "font-sans text-eyebrow font-semibold uppercase tracking-widest text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * FormLabel — Input field label. 14px / semibold.
 * Typically rendered via <label> element — pass htmlFor.
 */
export function FormLabel({
  className,
  children,
  ...props
}: AsProps<"label">) {
  return (
    <label
      className={cn(
        "font-sans text-form-label font-semibold tracking-wide text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}

/**
 * HelperText — Below-input hint or guidance. 13px.
 */
export function HelperText({ className, children, ...props }: AsProps<"p">) {
  return (
    <p
      className={cn(
        "font-sans text-helper-text leading-normal text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

/**
 * ErrorText — Validation error message. 13px / medium / destructive.
 */
export function ErrorText({ className, children, ...props }: AsProps<"p">) {
  return (
    <p
      role="alert"
      className={cn(
        "font-sans text-helper-text font-medium leading-normal text-destructive",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

/**
 * Mono — Data, IDs, counts, timestamps. JetBrains Mono 400.
 * Applies tabular-nums for stable layout during updates.
 */
export function Mono({ className, children, ...props }: AsProps<"span">) {
  return (
    <span
      className={cn(
        "font-mono text-sm tabular-nums text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
