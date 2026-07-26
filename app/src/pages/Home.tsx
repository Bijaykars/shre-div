import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { ProductCard } from "@/components/store/ProductCard";
import { SectionHead } from "@/components/store/StoreLayout";
import { Marquee } from "@/components/store/Chrome";
import { Reveal, Rise } from "@/components/store/Reveal";
import { SlideLabel } from "@/components/store/Motion";
import { DEPARTMENT_LABELS } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { HomeData, SettingsMap } from "@/lib/types";

export default function Home() {
  const { data, isLoading } = trpc.store.home.useQuery();
  const settings = data?.settings ?? {};

  return (
    <div>
      <Hero slides={data?.slides ?? []} loading={isLoading} />
      <Marquee
        items={
          settings.marquee?.split("|").map((s) => s.trim()).filter(Boolean) ?? [
            "Hand-finished in Kathmandu",
            "Small-batch boutique",
            "Cash on delivery",
          ]
        }
      />
      <Gateways settings={settings} />
      <FeaturedEdit data={data} loading={isLoading} />
      <CategoryIndex data={data} loading={isLoading} />
      <Bestsellers data={data} loading={isLoading} />
      <Testimonials data={data} loading={isLoading} />
      <Newsletter settings={settings} />
    </div>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function Hero({ slides, loading }: { slides: HomeData["slides"]; loading: boolean }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = slides.length;

  const go = useCallback(
    (next: number) => {
      if (count > 0) setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), 6500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [count]);

  if (loading) return <Skeleton className="h-[86vh] w-full rounded-none" />;
  if (count === 0) return null;

  return (
    <section className="relative h-[86vh] min-h-[560px] overflow-hidden bg-ivory-deep">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-slow ease-out",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {slide.image && (
            <img
              src={slide.image}
              alt=""
              className={cn(
                "h-full w-full object-cover transition-transform duration-drift ease-out",
                i === index ? "scale-105" : "scale-100",
              )}
            />
          )}
          {/* Ivory veil for legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/72 to-ivory/5" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
              <div className="max-w-2xl">
                {slide.eyebrow && (
                  <p
                    className={cn(
                      "eyebrow transition-all delay-200 duration-700",
                      i === index ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                    )}
                  >
                    {slide.eyebrow}
                  </p>
                )}
                <h1
                  className={cn(
                    "mt-5 font-display text-5xl font-medium leading-[1.02] text-ink transition-all delay-300 duration-700 md:text-7xl lg:text-[5.4rem]",
                    i === index ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
                  )}
                >
                  {slide.title}{" "}
                  {slide.highlight && (
                    <em className="italic text-rose">{slide.highlight}</em>
                  )}
                </h1>
                {slide.subtitle && (
                  <p
                    className={cn(
                      "mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft transition-all delay-500 duration-700",
                      i === index ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
                    )}
                  >
                    {slide.subtitle}
                  </p>
                )}
                <div
                  className={cn(
                    "mt-9 flex flex-wrap gap-4 transition-all delay-700 duration-700",
                    i === index ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
                  )}
                >
                  {slide.ctaText && slide.ctaLink && (
                    <Link to={slide.ctaLink} className="btn-sharp">
                      {slide.ctaText}
                    </Link>
                  )}
                  <Link to="/about" className="btn-sharp-ghost">
                    Our Story
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      {count > 1 && (
        <div className="absolute bottom-8 left-5 right-5 md:left-10 md:right-10">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-display text-lg italic text-ink">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => go(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={cn(
                      "h-px transition-all duration-500",
                      i === index ? "w-14 bg-rose" : "w-7 bg-ink/25 hover:bg-ink/50",
                    )}
                  />
                ))}
              </div>
              <span className="font-display text-lg italic text-ink-faint">
                {String(count).padStart(2, "0")}
              </span>
            </div>
            <div className="hidden gap-2 md:flex">
              <button
                onClick={() => go(index - 1)}
                aria-label="Previous"
                className="border border-ink/20 p-3 text-ink transition-colors hover:border-rose hover:bg-rose hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => go(index + 1)}
                aria-label="Next"
                className="border border-ink/20 p-3 text-ink transition-colors hover:border-rose hover:bg-rose hover:text-white"
              >
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* -------------------------------- Gateways -------------------------------- */

function Gateways({ settings }: { settings: SettingsMap }) {
  const gateways = [1, 2, 3]
    .map((n) => ({
      key: n,
      title: settings[`gateway${n}Title`] ?? "",
      sub: settings[`gateway${n}Sub`] ?? "",
      to: settings[`gateway${n}Link`] || "/shop",
      image: settings[`gateway${n}Image`] ?? "",
    }))
    .filter((g) => g.title);

  if (!gateways.length) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
      <SectionHead eyebrow="The Shop" title="Everything for" italic="little ones" />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {gateways.map((g, i) => (
          <Rise key={g.key} delay={i * 0.12}>
            <Link
              to={g.to}
             
              className="group relative block overflow-hidden bg-ink"
            >
              <div className="aspect-[3/4] w-full overflow-hidden">
                {g.image && (
                  <img
                    src={g.image}
                    alt={g.title}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-90 transition-[transform,opacity] duration-slow ease-out group-hover:scale-105 group-hover:opacity-70"
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="text-[10px] uppercase tracking-mega text-gold-soft">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-4xl italic text-cream">{g.title}</h3>
                <p className="mt-2 text-sm text-cream/70">{g.sub}</p>
                <p className="mt-4 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-cream/90 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  Enter <span>→</span>
                </p>
              </div>
            </Link>
          </Rise>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Featured edit ----------------------------- */

function FeaturedEdit({ data, loading }: { data?: HomeData; loading: boolean }) {
  return (
    <section className="border-y border-ink/10 bg-cream">
      <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
        <SectionHead
          eyebrow="The Edit"
          title="Pieces we're"
          italic="in love with"
          link="/shop"
          linkLabel="Shop everything"
        />
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[4/5] w-full rounded-none" />
                  <Skeleton className="mt-4 h-5 w-3/4 rounded-none" />
                  <Skeleton className="mt-2 h-4 w-1/3 rounded-none" />
                </div>
              ))
            : data?.featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Category index ----------------------------- */

function CategoryIndex({ data, loading }: { data?: HomeData; loading: boolean }) {
  if (loading) return null;
  const cats = data?.categories ?? [];
  if (!cats.length) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
      <SectionHead eyebrow="Index" title="Shop by" italic="collection" />
      <div className="mt-10 border-t border-ink/15">
        {cats.map((c, i) => (
          <Link
            key={c.id}
            to={`/shop?category=${c.slug}`}
            className="group grid grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-ink/15 py-6 transition-colors hover:bg-rose-pale/60 md:grid-cols-[80px_1fr_1fr_auto] md:py-7"
          >
            <span className="font-display text-lg italic text-gold-deep">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-2xl leading-tight text-ink transition-transform duration-300 group-hover:translate-x-2 md:text-4xl">
              {c.name}
            </h3>
            <p className="hidden max-w-xs text-sm text-ink-faint md:block">{c.tagline}</p>
            <span className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.25em] text-ink-faint transition-colors group-hover:text-rose">
              {DEPARTMENT_LABELS[c.department] ?? ""}
              <span className="text-base transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- Bestsellers ------------------------------ */

function Bestsellers({ data, loading }: { data?: HomeData; loading: boolean }) {
  const settings = data?.settings ?? {};
  if (loading || !data?.bestsellers.length) return null;

  return (
    <section className="bg-ink py-20 text-cream md:py-28">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal lines={["Most Loved"]} lineClassName="eyebrow !text-gold" duration={0.7} />
            <Reveal
              className="mt-3"
              delay={0.08}
              lines={[
                <h2 key="h" className="font-display text-4xl leading-[1.05] md:text-5xl">
                  The <em className="italic text-gold-soft">bestsellers</em>
                </h2>,
              ]}
            />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-cream/50">
            {settings.bestsellersNote ||
              "Pieces our customers return for — restocked in small batches and often gone within the week."}
          </p>
        </div>

        <div className="no-scrollbar mt-12 flex gap-5 overflow-x-auto pb-2">
          {data.bestsellers.map((p, i) => (
            <Link
              key={p.id}
              to={`/product/${p.slug}`}
             
              className="group relative w-[240px] shrink-0 md:w-[280px]"
            >
              <div className="relative overflow-hidden">
                <div className="aspect-[4/5] overflow-hidden">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-90 transition-[transform,opacity] duration-slow ease-out group-hover:scale-105 group-hover:opacity-100"
                    />
                  )}
                </div>
                <span className="pointer-events-none absolute -left-1 -top-3 font-display text-7xl italic text-cream/15">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl leading-snug transition-colors group-hover:text-gold-soft">
                {p.name}
              </h3>
              <p className="mt-1 text-sm text-cream/60">
                Rs. {p.price.toLocaleString("en-US")}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Testimonials ------------------------------ */

function Testimonials({ data, loading }: { data?: HomeData; loading: boolean }) {
  const [index, setIndex] = useState(0);
  const quotes = data?.quotes ?? [];
  const count = quotes.length;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearInterval(t);
  }, [count]);

  if (loading || count === 0) return null;
  const q = quotes[index];

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">What Parents Say</p>
        <div className="mt-8 min-h-[180px] md:min-h-[200px]">
          <blockquote
            key={q.id}
            className="animate-fade-in font-display text-2xl italic leading-[1.35] text-ink md:text-[2rem]"
          >
            “{q.quote}”
          </blockquote>
        </div>
        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.28em] text-ink">
          {q.name}
        </p>
        {q.location && (
          <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-ink-faint">{q.location}</p>
        )}

        <div className="mt-10 flex items-center justify-center gap-2">
          {quotes.map((quote, i) => (
            <button
              key={quote.id}
              onClick={() => setIndex(i)}
              aria-label={`Testimonial ${i + 1}`}
              className={cn(
                "h-px transition-all duration-500",
                i === index ? "w-12 bg-rose" : "w-6 bg-ink/20 hover:bg-ink/40",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Newsletter ------------------------------- */

function Newsletter({ settings }: { settings: SettingsMap }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const subscribe = trpc.store.subscribe.useMutation({
    onSuccess: () => {
      setDone(true);
      setEmail("");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <section className="border-t border-ink/10 bg-rose-pale">
      <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-xl text-center">
          <Reveal lines={["The Shré~Div List"]} lineClassName="eyebrow" duration={0.7} />
          <Reveal
            className="mt-3"
            delay={0.08}
            lines={[
              <h2 key="h" className="font-display text-4xl leading-tight text-ink md:text-5xl">
                {settings.newsletterTitle || (
                  <>
                    First to know when <em className="italic text-rose">new pieces</em> arrive
                  </>
                )}
              </h2>,
            ]}
          />
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {settings.newsletterBody ||
              "Small batches sell out quietly. Join the list for early access to new arrivals, restocks and seasonal offers."}
          </p>
          {done ? (
            <p className="mt-8 border border-rose/30 bg-cream px-6 py-4 font-display text-xl italic text-rose">
              You're on the list — welcome to the family.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) subscribe.mutate({ email: email.trim() });
              }}
              className="mt-8 flex border border-ink/20 bg-cream"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full bg-transparent px-5 py-4 text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              <button
                type="submit"
                disabled={subscribe.isPending}
                className="shrink-0 bg-ink px-6 text-[10px] font-medium uppercase tracking-[0.25em] text-cream transition-colors hover:bg-rose disabled:opacity-50"
              >
                <SlideLabel>{subscribe.isPending ? "Joining…" : "Join"}</SlideLabel>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
