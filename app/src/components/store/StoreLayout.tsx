import { Link, Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Chrome";
import { CartDrawer } from "./CartDrawer";
import { SlideLabel, SmoothScroll } from "./Motion";
import { Reveal } from "./Reveal";

export function StoreLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <SmoothScroll />
      <Header />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  italic,
  link,
  linkLabel,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  link?: string;
  linkLabel?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "flex flex-wrap items-end justify-between gap-6"
      }
    >
      <div>
        <Reveal lines={[eyebrow]} lineClassName="eyebrow" duration={0.7} />
        <Reveal
          className="mt-3"
          delay={0.08}
          lines={[
            <h2 key="h" className="font-display text-4xl leading-[1.05] text-ink md:text-5xl">
              {title} {italic && <em className="font-medium italic text-rose">{italic}</em>}
            </h2>,
          ]}
        />
      </div>
      {link && (
        <Link
          to={link}
          className="group flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.25em] text-ink transition-colors hover:text-rose"
        >
          <SlideLabel>{linkLabel ?? "View all"}</SlideLabel>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  );
}
