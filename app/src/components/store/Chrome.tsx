import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { SlideLabel } from "./Motion";

export function Marquee({ items }: { items: string[] }) {
  if (!items.length) return null;
  const row = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden border-y border-rose-deep/20 bg-rose py-3">
      <div className="flex w-max animate-marquee items-center">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center" aria-hidden={half === 1}>
            {row.map((item, i) => (
              <span key={`${half}-${i}`} className="flex items-center">
                <span className="whitespace-nowrap px-8 font-display text-lg italic tracking-wide text-rose-pale">
                  {item}
                </span>
                <span className="text-[10px] text-gold-soft">◆</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MapBanner() {
  const { data: settings } = trpc.store.settings.useQuery();
  const address = settings?.address;
  if (!address) return null;

  // mapQuery lets the shop nudge the pin without touching the address text.
  // The `output=embed` form needs no API key, which keeps this free to run.
  const query = encodeURIComponent(settings?.mapQuery || address);
  const embed = `https://www.google.com/maps?q=${query}&z=16&output=embed`;
  const directions = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <section className="border-t border-ink/10 bg-cream">
      <div className="mx-auto grid max-w-[1440px] gap-0 md:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-14 md:px-10 md:py-20">
          <p className="eyebrow">Come and see us</p>
          <h2 className="mt-3 font-display text-4xl leading-[1.05] text-ink md:text-5xl">
            Visit the <em className="italic text-rose">shop</em>
          </h2>

          <address className="mt-7 space-y-2 text-[15px] not-italic leading-relaxed text-ink-soft">
            <p className="text-ink">{address}</p>
            {settings?.hours && <p>{settings.hours}</p>}
            {settings?.phone && (
              <p>
                <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="link-sweep">
                  {settings.phone}
                </a>
              </p>
            )}
          </address>

          <div className="mt-9 flex flex-wrap gap-4">
            <a href={directions} target="_blank" rel="noreferrer noopener" className="btn-sharp">
              <SlideLabel>Get Directions</SlideLabel>
              <span aria-hidden>→</span>
            </a>
            <Link to="/contact" className="btn-sharp-ghost">
              Contact Us
            </Link>
          </div>
        </div>

        <div className="min-h-[320px] md:min-h-[440px]">
          <iframe
            title={`Map showing ${address}`}
            src={embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0 grayscale-[0.35] contrast-[1.05]"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { data: settings } = trpc.store.settings.useQuery();
  const { data: categories } = trpc.store.categories.useQuery();

  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-4">
              <img src="/brand/logo.png" alt="Shré~Div" className="h-20 w-auto rounded-full bg-cream p-1" />
              <div>
                <p className="font-display text-3xl">Shré~Div</p>
                <p className="mt-1 text-[10px] uppercase tracking-mega text-gold">
                  Clothing · Toys · Nursery
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/60">
              A family shop in Kapan, Kathmandu — small-batch children's clothing,
              wooden toys, and nursery gear chosen to last. Finished by hand,
              wrapped like a gift.
            </p>
          </div>

          {/* Shop */}
          <div className="md:col-span-2">
            <p className="eyebrow !text-gold">Shop</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li><FooterLink to="/shop">Everything</FooterLink></li>
              <li><FooterLink to="/shop?department=clothing">Clothing</FooterLink></li>
              <li><FooterLink to="/shop?department=toys">Toys &amp; Games</FooterLink></li>
              {categories?.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <FooterLink to={`/shop?category=${c.slug}`}>{c.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Maison */}
          <div className="md:col-span-2">
            <p className="eyebrow !text-gold">Maison</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li><FooterLink to="/about">Our Story</FooterLink></li>
              <li><FooterLink to="/contact">Contact</FooterLink></li>
              <li><FooterLink to="/login">Account</FooterLink></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <p className="eyebrow !text-gold">Visit · Write · Call</p>
            <ul className="mt-5 space-y-3 text-sm text-cream/70">
              {settings?.address && <li>{settings.address}</li>}
              {settings?.phone && <li>{settings.phone}</li>}
              {settings?.email && <li>{settings.email}</li>}
              {settings?.hours && <li>{settings.hours}</li>}
              {settings?.instagram && (
                <li className="pt-2 font-display text-lg italic text-gold-soft">{settings.instagram}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-5 py-5 text-[10px] uppercase tracking-[0.25em] text-cream/40 md:flex-row md:px-10">
          <p>© {new Date().getFullYear()} Shré~Div · All rights reserved</p>
          <p>Hand-finished in Kathmandu, Nepal</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-cream/70 transition-colors hover:text-gold-soft">
      {children}
    </Link>
  );
}
