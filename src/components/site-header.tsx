import { Link } from "@tanstack/react-router";
import { Search, User, ShoppingCart, Menu } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/library", label: "Library" },
  { to: "/publications", label: "Publications" },
  { to: "/articles", label: "Articles" },
  { to: "/discover", label: "Discover" },
  { to: "/authors", label: "Authors" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
];


export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="rule-bottom bg-paper sticky top-0 z-40 backdrop-blur">
      {/* Utility bar */}
      <div className="rule-bottom bg-secondary/60">
        <div className="container-edit flex h-9 items-center justify-between text-[11px] tracking-wide text-muted-foreground uppercase">
          <span className="hidden sm:inline">Saturday, 11 July 2026 · Chennai Edition</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-primary">Login</Link>
            <Link to="/register" className="hover:text-primary">Register</Link>
            <Link to="/account" className="hover:text-primary hidden sm:inline">My Account</Link>
            <Link to="/cart" className="hover:text-primary inline-flex items-center gap-1">
              <ShoppingCart className="h-3.5 w-3.5" /> Cart
            </Link>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="container-edit grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-6 sm:grid-cols-3">
        <div className="hidden sm:block text-xs text-muted-foreground uppercase tracking-widest">
          Vol. XXIV · No. 187
        </div>
        <Link to="/" className="min-w-0 text-center">
          <div className="font-serif text-3xl sm:text-4xl leading-none">
            <span className="text-primary">Swathi</span> Publications
          </div>
          <div className="mt-1 text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            Journalism of consequence · Est. 1970
          </div>
        </Link>
        <div className="flex items-center justify-end gap-3">
          <Link to="/search" className="hidden md:inline-flex items-center gap-2 rule-bottom border-b border-input px-2 py-1 text-sm text-muted-foreground hover:text-foreground">
            <Search className="h-4 w-4" /> Search articles
          </Link>
          <Link to="/account" aria-label="Account" className="hover:text-primary">
            <User className="h-5 w-5" />
          </Link>
          <button
            className="sm:hidden"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="rule-top rule-bottom bg-paper">
        <div className="container-edit hidden sm:flex items-center justify-center gap-6 md:gap-8 py-3 text-[13px] font-medium uppercase tracking-wider">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-foreground/80 hover:text-primary" }}
              className="transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </div>
        {open && (
          <div className="sm:hidden container-edit flex flex-col gap-2 py-3 text-sm">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="py-1" onClick={() => setOpen(false)}>{n.label}</Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
