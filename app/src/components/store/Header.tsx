import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { SlideLabel } from "./Motion";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/lib/cart";
import { DEPARTMENT_LABELS } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Clothing", to: "/shop?department=clothing" },
  { label: "Toys", to: "/shop?department=toys" },
  { label: "Nursery", to: "/shop?department=nursery" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function Header() {
  const { count, setOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: settings } = trpc.store.settings.useQuery();
  const { data: categories } = trpc.store.categories.useQuery();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement */}
      {settings?.announcement && (
        <div className="bg-ink px-4 py-2 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-gold-soft">
            {settings.announcement}
          </p>
        </div>
      )}

      <div
        className={cn(
          "border-b bg-cream/95 backdrop-blur transition-shadow duration-300",
          scrolled ? "border-ink/15 shadow-[0_1px_0_0_rgb(38_32_31/0.06)]" : "border-ink/10",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-5 md:h-[72px] md:px-10">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="-ml-1 p-1 md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5 text-ink" strokeWidth={1.5} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] bg-cream p-0">
              <div className="flex h-full flex-col">
                <div className="border-b border-ink/10 p-6">
                  <img src="/brand/logo.png" alt="Shré~Div" className="h-16 w-auto" />
                </div>
                <nav className="flex flex-col p-6">
                  <MobileLink to="/shop" onClick={() => setMobileOpen(false)}>Shop All</MobileLink>
                  {NAV_LINKS.map((l) => (
                    <MobileLink key={l.to} to={l.to} onClick={() => setMobileOpen(false)}>
                      {l.label}
                    </MobileLink>
                  ))}
                  <p className="eyebrow mb-2 mt-8">Categories</p>
                  {categories?.map((c) => (
                    <MobileLink
                      key={c.id}
                      to={`/shop?category=${c.slug}`}
                      onClick={() => setMobileOpen(false)}
                      small
                    >
                      {c.name}
                    </MobileLink>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <img src="/brand/logo.png" alt="Shré~Div" className="h-11 w-auto md:h-14" />
            <span className="hidden font-display text-xl tracking-wide text-ink lg:block">
              Shré<span className="text-rose">~</span>Div
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-auto hidden items-center gap-8 md:flex">
            {/* Shop with category flyout */}
            <div className="group relative">
              <Link
                to="/shop"
                className="link-sweep block py-6 text-[11px] font-medium uppercase tracking-[0.22em] text-ink"
              >
                <SlideLabel>Shop</SlideLabel>
              </Link>
              <div className="invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 border border-ink/10 bg-cream opacity-0 shadow-lift transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="p-2">
                  <FlyoutLink to="/shop">View Everything</FlyoutLink>
                  <div className="mx-3 my-1 h-px bg-ink/10" />
                  {categories?.map((c) => (
                    <FlyoutLink key={c.id} to={`/shop?category=${c.slug}`}>
                      <span>{c.name}</span>
                      <span className="text-[10px] uppercase tracking-widest text-ink-faint">
                        {DEPARTMENT_LABELS[c.department] ?? ""}
                      </span>
                    </FlyoutLink>
                  ))}
                </div>
              </div>
            </div>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="link-sweep block py-6 text-[11px] font-medium uppercase tracking-[0.22em] text-ink"
              >
                <SlideLabel>{l.label}</SlideLabel>
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <button
              className="p-2 text-ink transition-colors hover:text-rose"
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
            >
              {searchOpen ? <X className="h-[18px] w-[18px]" strokeWidth={1.5} /> : <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />}
            </button>
            <Link
              to={user?.role === "admin" ? "/admin" : "/login"}
              className="hidden p-2 text-ink transition-colors hover:text-rose sm:block"
              aria-label="Account"
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>
            <button
              className="relative p-2 text-ink transition-colors hover:text-rose"
              aria-label="Open bag"
              onClick={() => setOpen(true)}
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center bg-rose px-1 text-[9px] font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expanding search */}
        <div
          className={cn(
            "overflow-hidden border-ink/10 transition-all duration-300",
            searchOpen ? "max-h-20 border-t" : "max-h-0",
          )}
        >
          <form onSubmit={submitSearch} className="mx-auto flex max-w-[1440px] items-center gap-4 px-5 py-3 md:px-10">
            <Search className="h-4 w-4 shrink-0 text-ink-faint" strokeWidth={1.5} />
            <input
              autoFocus={searchOpen}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search frocks, lehengas, kurtas…"
              className="w-full bg-transparent font-display text-lg italic text-ink outline-none placeholder:text-ink-faint"
            />
            <button type="submit" className="text-[11px] font-medium uppercase tracking-[0.22em] text-rose">
              Search
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

function FlyoutLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px] text-ink transition-colors hover:bg-rose-pale hover:text-rose"
    >
      {children}
    </Link>
  );
}

function MobileLink({
  to,
  children,
  onClick,
  small,
}: {
  to: string;
  children: React.ReactNode;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "border-b border-ink/8 py-3 text-ink transition-colors hover:text-rose",
        small ? "pl-3 text-sm text-ink-soft" : "font-display text-2xl",
      )}
    >
      {children}
    </Link>
  );
}
