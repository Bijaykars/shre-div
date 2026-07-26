import { useEffect, useRef, useState } from "react";

/** One easing curve, everywhere. Ported from the Petit Noir motion language. */
export const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Fires once when the element scrolls into view, then stops observing. */
export function useInViewOnce<T extends HTMLElement>(amount = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount]);

  return { ref, inView };
}
