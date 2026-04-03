import { useEffect } from "react";

/**
 * Locks `document.body` scroll while `enabled` is true.
 *
 * Strategy ("double-lock"):
 *  1. CSS lock  — sets `overflow: hidden` on body so no scroll events reach it.
 *  2. Layout compensation — measures the scrollbar width before hiding it and
 *     adds that value as `padding-right` so the page layout doesn't jump.
 *
 * Restores the *exact* prior inline style values on cleanup so callers that
 * already have body styles set (e.g. Radix UI, other portals) are not clobbered.
 *
 * IMPORTANT — Do NOT call this hook inside a component rendered inside a
 * Radix UI <Dialog> (or any other library that manages its own body lock).
 * Radix applies its lock synchronously during its own effect; if this hook
 * also runs it will snapshot `overflow: hidden` as the "previous" value and
 * restore that on unmount — permanently freezing scroll after the dialog closes.
 * Use this hook *alongside* (same render level as) library dialogs, or use it
 * exclusively in fully custom portal modals built with `createPortal` directly.
 *
 * @param enabled - Pass `true` while the modal is open, `false` otherwise.
 */
export function useScrollLock(enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;

    const body = document.body;

    // Measure before touching the DOM so the scrollbar is still visible.
    // window.innerWidth includes the scrollbar; clientWidth excludes it.
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // Snapshot current inline values — may be empty strings if unset.
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    body.style.overflow = "hidden";

    // Only compensate if a classic (layout-consuming) scrollbar existed.
    // Overlay scrollbars (macOS default, mobile) report 0 — no adjustment needed.
    if (scrollbarWidth > 0) {
      // Parse any existing padding-right so we add to it rather than replace it.
      const existingPaddingRight = parseFloat(
        getComputedStyle(body).paddingRight,
      );
      body.style.paddingRight = `${existingPaddingRight + scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [enabled]);
}
