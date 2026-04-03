/**
 * ModalPortal — a self-contained, production-ready modal primitive built on
 * React's createPortal.  Use this when you need a fully custom modal without
 * a component library like Radix UI.
 *
 * WHY createPortal?
 * ─────────────────
 * A modal rendered inside a regular React tree inherits every ancestor's
 * CSS stacking context (transform, filter, will-change, isolation, etc.).
 * Any ancestor with one of those properties creates a new stacking context
 * that caps z-index — a z-index of 9999 inside such a container can still
 * render *beneath* a z-index: 1 element outside it.  By portalling to
 * document.body the modal escapes all ancestor stacking contexts and sits at
 * the top of the document's own stacking context, guaranteeing it appears
 * above everything else.
 *
 * It also means scroll containment is clean: the modal panel's scroll
 * container is a direct child of body rather than of a deeply nested DOM
 * subtree, so there are no unexpected ancestors to scroll-chain into.
 *
 * Scroll strategy ("double-lock"):
 * ──────────────────────────────────
 * 1. useScrollLock — locks body via `overflow: hidden` + padding compensation.
 * 2. overscroll-behavior: contain on the panel — ensures that when the user
 *    reaches the top/bottom of the panel list, the event is absorbed and not
 *    chained to the (now hidden) body scroll.
 *
 * Accessibility:
 * ──────────────
 * • role="dialog" + aria-modal="true" tells screen readers the rest of the
 *   page is inert while the modal is open.
 * • autoFocus on the panel traps keyboard focus inside (combine with a
 *   FocusTrap library for full WCAG 2.1 compliance if required).
 * • Escape key closes the modal.
 * • Backdrop click closes the modal.
 */

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/hooks/use-scroll-lock";

export interface ModalPortalProps {
  /** Controls visibility. */
  open: boolean;
  /** Called when the user requests a close (Escape key or backdrop click). */
  onClose: () => void;
  /**
   * Accessible label for the dialog.
   * Provide either this or `aria-labelledby` pointing to an inner heading.
   */
  "aria-label"?: string;
  /** ID of the element that labels this dialog (alternative to aria-label). */
  "aria-labelledby"?: string;
  /** Additional classes for the panel container. */
  panelClassName?: string;
  children: ReactNode;
}

export function ModalPortal({
  open,
  onClose,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  panelClassName,
  children,
}: ModalPortalProps) {
  // Lock body scroll for the lifetime of the open modal.
  // This hook is safe here because ModalPortal is NOT a Radix component —
  // there is no competing library lock that would cause a restore conflict.
  useScrollLock(open);

  const panelRef = useRef<HTMLDivElement>(null);

  // Move focus into the panel when it opens so keyboard users are immediately
  // inside the modal's focus scope.
  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  };

  if (!open) return null;

  return createPortal(
    // Full-screen backdrop — intercepts pointer events to the page below.
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      aria-hidden="false"
      // Clicking the backdrop (but NOT the panel) closes the modal.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/*
       * Modal panel.
       *
       * Key Tailwind classes explained:
       * ─────────────────────────────────
       * relative          — establishes a stacking context for the close button
       * z-10              — lifts panel above the backdrop within this context
       * flex flex-col     — stack header/body/footer vertically
       * w-full max-w-2xl  — responsive width cap
       * max-h-[80vh]      — hard height cap; triggers overflow once content exceeds it
       * rounded-lg border bg-background shadow-lg — visual chrome
       *
       * overflow-y-auto is intentionally NOT here — it belongs on the scrollable
       * inner region, not the panel itself.  Putting it on the panel would scroll
       * the entire panel including the sticky header, which is wrong.
       */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative z-10 flex w-full max-w-2xl flex-col",
          "max-h-[80vh]",
          "rounded-lg border bg-background shadow-lg",
          "outline-none",
          panelClassName,
        )}
        // Stop wheel events from reaching the backdrop/body once they would
        // otherwise escape the panel (belt-and-suspenders alongside
        // overscroll-contain on the inner scroll region).
        onWheel={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

/**
 * ModalScrollBody — the scrollable region inside a ModalPortal panel.
 *
 * Separate from the panel so that sticky headers/footers remain outside the
 * scroll container and don't scroll away.
 *
 * Key classes:
 *   flex-1       — fills remaining height after header/footer take their space
 *   min-h-0      — CRITICAL: overrides flex child's default min-height:auto so
 *                  the element can actually shrink to the panel's constrained
 *                  height rather than expanding to fit all content
 *   overflow-y-auto         — shows a scrollbar when content overflows
 *   overscroll-contain      — absorbs scroll events at boundaries; prevents
 *                             them bubbling to body even without the body lock
 */
export function ModalScrollBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex-1 min-h-0 overflow-y-auto overscroll-contain",
        className,
      )}
    >
      {children}
    </div>
  );
}
