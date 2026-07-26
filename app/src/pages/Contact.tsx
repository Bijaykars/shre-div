import { Mail, MapPin, Phone, Instagram, Clock } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function Contact() {
  const { data: settings } = trpc.store.settings.useQuery();

  const cards = [
    {
      icon: MapPin,
      label: "Visit Us",
      value: settings?.address,
    },
    {
      icon: Phone,
      label: "Call · Viber · WhatsApp",
      value: settings?.phone,
      href: settings?.phone ? `tel:${settings.phone.replace(/[^+\d]/g, "")}` : undefined,
    },
    {
      icon: Mail,
      label: "Write to us",
      value: settings?.email,
      href: settings?.email ? `mailto:${settings.email}` : undefined,
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: settings?.instagram,
      href: settings?.instagram
        ? `https://instagram.com/${settings.instagram.replace("@", "")}`
        : undefined,
    },
    {
      icon: Clock,
      label: "Hours",
      value: settings?.hours,
    },
  ].filter((c) => c.value);

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10">
      <div className="border-b border-ink/10 py-14 text-center md:py-20">
        <p className="eyebrow">Contact</p>
        <h1 className="mx-auto mt-4 max-w-2xl font-display text-5xl leading-[1.05] text-ink md:text-6xl">
          We'd love to <em className="italic text-rose">hear from you</em>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
          Sizing questions, made-to-order requests, or a gift that needs to be
          just right — write, call, or come and see us.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Inner = (
            <>
              <c.icon className="h-5 w-5 text-rose" strokeWidth={1.4} />
              <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-ink-faint">{c.label}</p>
              <p className="mt-2 font-display text-xl text-ink">{c.value}</p>
            </>
          );
          return c.href ? (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="bg-cream p-8 transition-colors hover:bg-rose-pale"
            >
              {Inner}
            </a>
          ) : (
            <div key={c.label} className="bg-cream p-8">
              {Inner}
            </div>
          );
        })}
      </div>

      <p className="mt-12 text-center font-display text-2xl italic text-ink-faint">
        “Every message is read at the sewing table — usually within the hour.”
      </p>
    </div>
  );
}
