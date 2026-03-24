import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToTop } from "@/lib/scroll";

export const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) return; // let browser handle anchor links naturally
    scrollToTop();
  }, [pathname, search]);

  return null;
};
