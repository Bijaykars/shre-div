import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { SectionHead } from "@/components/store/StoreLayout";

export default function About() {
  const { data: settings } = trpc.store.settings.useQuery();

  const title = settings?.aboutTitle || "Everything for little ones, chosen with care";
  const body =
    settings?.aboutBody ||
    "Shré~Div is a family shop in Lalitpur, Nepal — children's clothing made in small batches, alongside toys and nursery gear chosen to last.";
  const paragraphs = body.split(/\n+/).filter(Boolean);

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10">
      {/* Head */}
      <div className="grid items-center gap-12 border-b border-ink/10 py-14 md:py-20 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Our Story</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] text-ink md:text-6xl">
            {title.split(" ").slice(0, -2).join(" ")}{" "}
            <em className="italic text-rose">{title.split(" ").slice(-2).join(" ")}</em>
          </h1>
          <div className="mt-8 max-w-lg space-y-5 text-[15px] leading-relaxed text-ink-soft">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Link to="/shop" className="btn-sharp mt-10">
            Shop the Collection
          </Link>
        </div>
        <div className="frame-hairline overflow-hidden">
          <div className="aspect-[4/5] max-h-[640px] w-full">
            <img
              src={settings?.aboutImage || "/images/about/atelier.jpg"}
              alt="Inside the Shré~Div workshop"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-16 md:py-24">
        <SectionHead eyebrow="What we hold dear" title="Three quiet" italic="promises" align="center" />
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {[
            {
              n: "I",
              t: "Small batches, always",
              d: "We cut a handful of pieces at a time — never warehouses of stock. When a batch sells out, it's gone; the next one is never quite the same.",
            },
            {
              n: "II",
              t: "Hands before machines",
              d: "Smocking, jari threadwork and pearl embroidery are done by artisans across the valley — crafts that take hours and last generations.",
            },
            {
              n: "III",
              t: "Made to be kept",
              d: "Every seam is finished to survive hand-me-downs. A Shré~Div piece should outlive the occasion it was bought for.",
            },
          ].map((v) => (
            <div key={v.n} className="border-t border-ink/15 pt-6">
              <p className="font-display text-4xl italic text-gold-deep">{v.n}</p>
              <h3 className="mt-4 font-display text-2xl text-ink">{v.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-faint">{v.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
