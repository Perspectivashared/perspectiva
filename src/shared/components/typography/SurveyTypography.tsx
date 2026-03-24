/**
 * Survey-specific typography components for Perspectiva.
 *
 * These components enforce the survey UX typography guidelines:
 * - Questions at 19px (survey-q token) for sustained readability
 * - Options at 16px body size — same importance as body text
 * - Max line length 65ch for questions (optimal reading measure)
 * - Plus Jakarta Sans throughout (not Space Grotesk) — reduces fatigue
 * - Error states only use destructive color (never red for "Required" badges)
 */

import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

// ─── Survey Question ───────────────────────────────────────────────────────

interface SurveyQuestionTextProps extends ComponentPropsWithoutRef<"p"> {
  children: ReactNode;
  /** When true, apply a slightly bolder weight to improve scannability */
  prominent?: boolean;
}

/**
 * SurveyQuestionText — Primary question text.
 *
 * 19px / Plus Jakarta Sans 500 / lh 1.65 / max 65ch
 * These values are tuned for extended survey sessions.
 */
export function SurveyQuestionText({
  className,
  children,
  prominent = false,
  ...props
}: SurveyQuestionTextProps) {
  return (
    <p
      className={cn(
        "font-sans text-survey-q leading-survey text-foreground",
        "max-w-[65ch]",
        prominent ? "font-medium" : "font-normal",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// ─── Survey Question Description ──────────────────────────────────────────

/**
 * SurveyQuestionDescription — Optional sub-text beneath a question.
 * Muted, slightly smaller than the question — gives context without competing.
 */
export function SurveyQuestionDescription({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cn(
        "font-sans text-sm leading-relaxed text-muted-foreground",
        "max-w-[60ch]",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// ─── Survey Question Number ────────────────────────────────────────────────

interface SurveyQuestionNumberProps extends ComponentPropsWithoutRef<"span"> {
  /** The sequential question number */
  order: number;
  /** Total questions in survey — used for accessible aria-label */
  total?: number;
}

/**
 * SurveyQuestionNumber — De-emphasized ordinal indicator.
 * Visually subdued so respondents focus on the question, not the count.
 */
export function SurveyQuestionNumber({
  order,
  total,
  className,
  ...props
}: SurveyQuestionNumberProps) {
  return (
    <span
      aria-label={total ? `Question ${order} of ${total}` : `Question ${order}`}
      className={cn(
        "font-mono text-xs font-medium tabular-nums text-muted-foreground/60",
        className,
      )}
      {...props}
    >
      {order}
      {total ? (
        <span className="opacity-40">/{total}</span>
      ) : null}
    </span>
  );
}

// ─── Survey Answer Option ──────────────────────────────────────────────────

interface SurveyAnswerOptionProps extends ComponentPropsWithoutRef<"span"> {
  /** Whether this option is currently selected */
  selected?: boolean;
}

/**
 * SurveyAnswerOption — Label text for radio / checkbox answer options.
 *
 * Same size as body text (16px). The answer IS the primary content;
 * never subordinate it visually to the question.
 */
export function SurveyAnswerOption({
  className,
  children,
  selected = false,
  ...props
}: SurveyAnswerOptionProps) {
  return (
    <span
      className={cn(
        "font-sans text-survey-option leading-normal",
        selected
          ? "font-medium text-foreground"
          : "font-normal text-foreground/90",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ─── Survey Required Indicator ────────────────────────────────────────────

/**
 * SurveyRequiredBadge — "Required" indicator.
 *
 * Uses a neutral muted style (NOT red/destructive).
 * Red is reserved for actual validation errors, not field requirements.
 */
export function SurveyRequiredBadge({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      aria-label="Required field"
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5",
        "font-sans text-[0.6875rem] font-semibold uppercase tracking-widest",
        "bg-muted text-muted-foreground/80",
        className,
      )}
      {...props}
    >
      Required
    </span>
  );
}

// ─── Survey Section Heading ────────────────────────────────────────────────

/**
 * SurveySectionHeading — Groups of related questions.
 * Uses body font (not display) — structural but not distracting.
 */
export function SurveySectionHeading({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cn(
        "font-sans text-xl font-semibold leading-snug text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

// ─── Survey Progress Label ─────────────────────────────────────────────────

interface SurveyProgressLabelProps extends ComponentPropsWithoutRef<"span"> {
  answered: number;
  total: number;
}

/**
 * SurveyProgressLabel — "{answered}/{total} answered" counter.
 * Tabular numerals prevent layout shift as numbers increment.
 */
export function SurveyProgressLabel({
  answered,
  total,
  className,
  ...props
}: SurveyProgressLabelProps) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <span
      aria-label={`${answered} of ${total} questions answered, ${pct}% complete`}
      className={cn(
        "font-mono text-sm tabular-nums text-muted-foreground",
        className,
      )}
      {...props}
    >
      {answered}
      <span className="opacity-50">/{total}</span>
    </span>
  );
}
