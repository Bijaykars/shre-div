import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router";
import Lenis from "lenis";
import { prefersReducedMotion } from "@/lib/anim";

// ponytail: module-level handle so callers outside this component can scroll
// through Lenis instead of fighting it. Single instance, mounted once in
// StoreLayout — a context would be more code for no extra safety here.
let active: Lenis | null = null;

/** Jump the page to `y`. Routes through Lenis when it's running. */
export function scrollToY(y: number) {
  if (active) active.scrollTo(y, { immediate: true });
  else window.scrollTo(0, y);
}

/** Inertial scrolling, plus scroll-to-top on navigation. */
export function SmoothScroll() {
  const { pathname } = useLocation();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const instance = new Lenis({
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.current = instance;
    active = instance;

    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    // Lenis hijacks scroll, so `scroll-behavior: smooth` would fight it.
    document.documentElement.style.scrollBehavior = "auto";
    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      lenis.current = null;
      active = null;
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  // React Router keeps the old scroll position across navigations. When the new
  // page is shorter, the browser clamps it — landing you at the footer. Reset on
  // pathname only: /shop filter changes are query-string edits and must not jump.
  useLayoutEffect(() => {
    scrollToY(0);
  }, [pathname]);

  return null;
}

/** Duplicated label for the slide-up hover micro-interaction (see .slide-label). */
export function SlideLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="slide-label">
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
  );
}
