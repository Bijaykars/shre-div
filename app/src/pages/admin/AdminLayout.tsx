import { Navigate, NavLink, Outlet } from "react-router";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  PanelsTopLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/content", label: "Homepage", icon: PanelsTopLeft },
  { to: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-ivory">
        <div className="w-64 bg-ink" />
        <div className="flex-1 p-10">
          <Skeleton className="h-10 w-64 rounded-none" />
          <div className="mt-8 grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-none" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
        <p className="font-display text-4xl italic text-ink">This door is closed</p>
        <p className="mt-3 max-w-md text-sm text-ink-faint">
          You're signed in as {user.name || user.email}, but this account doesn't have
          administrator access to Shré~Div.
        </p>
        <NavLink to="/" className="btn-sharp mt-8">
          Back to the Store
        </NavLink>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-ink text-cream">
        <div className="flex items-center gap-3 border-b border-cream/10 px-5 py-5">
          <img src="/brand/logo.png" alt="" className="h-11 w-11 rounded-full bg-cream object-contain p-0.5" />
          <div>
            <p className="font-display text-lg leading-tight">Shré~Div</p>
            <p className="text-[9px] uppercase tracking-[0.28em] text-gold">Shop Console</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors",
                  isActive
                    ? "bg-rose text-white"
                    : "text-cream/60 hover:bg-cream/5 hover:text-cream",
                )
              }
            >
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-cream/10 p-3">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-cream/60 transition-colors hover:text-cream"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
            View Store
          </NavLink>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] text-cream/60 transition-colors hover:text-cream"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-60 flex-1">
        <div className="border-b border-ink/10 bg-cream px-8 py-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.28em] text-ink-faint">
              Signed in as <span className="text-ink">{user.name || user.email}</span>
            </p>
            <p className="font-display text-sm italic text-gold-deep">Style for little ones, elegance for her</p>
          </div>
        </div>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
