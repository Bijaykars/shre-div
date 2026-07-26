import { EASE, useInViewOnce } from "@/lib/anim";
import { cn } from "@/lib/utils";

/**
 * Masked line-by-line reveal — each line slides up from behind an overflow mask.
 * ponytail: CSS transitions + IntersectionObserver instead of a motion library.
 * Reduced motion is handled in useInViewOnce (fires immediately, no transform).
 */
export function Reveal({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.1,
  duration = 1,
  amount = 0.3,
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  amount?: number;
}) {
  const { ref, inView } = useInViewOnce<HTMLSpanElement>(amount);

  return (
    <span ref={ref} className={cn("block", className)}>
      {lines.map((line, i) => (
        <span key={i} className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
          <span
            className={cn("block will-change-transform", lineClassName)}
            style={{
              transform: inView ? "translateY(0)" : "translateY(115%)",
              transition: `transform ${duration}s ${EASE} ${delay + i * stagger}s`,
            }}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Fade + lift for blocks that aren't text lines (cards, images, paragraphs). */
export function Rise({
  children,
  className,
  delay = 0,
  amount = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(amount);

  return (
    <div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.9s ${EASE} ${delay}s, transform 0.9s ${EASE} ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
