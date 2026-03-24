import type Lenis from "lenis";

let instance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return instance;
}

export function setLenis(lenis: Lenis | null): void {
  instance = lenis;
}

export function scrollToTop(): void {
  if (instance) {
    instance.scrollTo(0, { immediate: false });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
