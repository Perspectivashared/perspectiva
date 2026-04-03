import { useCallback, useEffect, useRef, useState } from "react";
import { getLenis } from "@/lib/scroll";

export const CustomScrollbar = () => {
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [visible, setVisible] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartScroll = useRef(0);

  const BUTTON_HEIGHT = 20;

  const updateScrollbar = useCallback(() => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const scrollable = scrollHeight - clientHeight;

    if (scrollable <= 0) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const trackH = clientHeight - BUTTON_HEIGHT * 2;
    const thumbH = Math.max(30, (clientHeight / scrollHeight) * trackH);
    const thumbT = (scrollTop / scrollable) * (trackH - thumbH);

    setThumbHeight(thumbH);
    setThumbTop(thumbT);
    setScrollPercent(Math.round((scrollTop / scrollable) * 100));
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", updateScrollbar);
    window.addEventListener("resize", updateScrollbar);
    updateScrollbar();
    return () => {
      window.removeEventListener("scroll", updateScrollbar);
      window.removeEventListener("resize", updateScrollbar);
    };
  }, [updateScrollbar]);

  const scrollBy = (amount: number) => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(window.scrollY + amount, { duration: 0.6 });
    } else {
      window.scrollBy({ top: amount, behavior: "smooth" });
    }
  };

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartScroll.current = window.scrollY;
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const clientHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;
      const trackH = clientHeight - BUTTON_HEIGHT * 2;
      const scrollable = scrollHeight - clientHeight;
      const delta = e.clientY - dragStartY.current;
      const scrollDelta = (delta / trackH) * scrollable;
      window.scrollTo({ top: dragStartScroll.current + scrollDelta });
    };

    const onMouseUp = () => { isDragging.current = false; };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed right-1 top-0 h-screen w-2.5 z-[9999] flex flex-col select-none">
      <button
        className="w-full flex-shrink-0 flex items-center justify-center hover:brightness-110 transition-[filter]"
        style={{ height: BUTTON_HEIGHT, color: "hsl(195 85% 45%)" }}
        onClick={() => scrollBy(-120)}
        aria-label="Scroll up"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M5 2L9 8H1z" fill="currentColor" />
        </svg>
      </button>

      <div className="relative flex-1">
        <div
          role="scrollbar"
          aria-controls="root"
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={scrollPercent}
          tabIndex={0}
          className="absolute w-full rounded-full cursor-pointer transition-[filter] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-300"
          style={{ top: thumbTop, height: thumbHeight, background: "var(--gradient-primary)" }}
          onMouseDown={handleThumbMouseDown}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); scrollBy(120); }
            if (e.key === "ArrowUp")   { e.preventDefault(); scrollBy(-120); }
          }}
        />
      </div>

      <button
        className="w-full flex-shrink-0 flex items-center justify-center hover:brightness-110 transition-[filter]"
        style={{ height: BUTTON_HEIGHT, color: "hsl(195 85% 45%)" }}
        onClick={() => scrollBy(120)}
        aria-label="Scroll down"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M5 8L1 2H9z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
};
