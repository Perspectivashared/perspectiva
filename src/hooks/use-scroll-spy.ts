import { useState, useEffect } from "react";

/**
 * Tracks which section is currently in view by observing elements by their IDs.
 * Uses IntersectionObserver with a rootMargin that triggers when a section
 * crosses into the upper quarter of the viewport — ideal for sticky sidebars.
 */
export function useScrollSpy(ids: readonly string[]): string {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    if (ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (intersecting.length > 0) {
          setActiveId(intersecting[0].target.id);
        }
      },
      // Top 20% of viewport is the "active zone"; bottom 65% is ignored.
      { rootMargin: "-20% 0px -65% 0px" },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}
