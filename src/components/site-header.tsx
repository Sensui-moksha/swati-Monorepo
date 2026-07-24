import { Link, useRouter } from "@tanstack/react-router";
import { Search, User, ShoppingCart, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { authApi } from "@/lib/api/endpoints/auth";
import logoImg from "../assets/logo.png";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/library", label: "Library" },
  { to: "/publications", label: "Publications" },
  { to: "/articles", label: "Articles" },
  { to: "/discover", label: "Discover" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
];


export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Check if user is authenticated by querying /auth/me
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => authApi.me().then((r: any) => r?.data?.user || r?.data || null),
    enabled: apiClient.isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isLoggedIn = apiClient.isAuthenticated() && !!currentUser;

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      apiClient.clearTokens();
      queryClient.clear();
      router.navigate({ to: "/" });
    },
    onError: () => {
      // Clear tokens even if logout API fails
      apiClient.clearTokens();
      queryClient.clear();
      router.navigate({ to: "/" });
    },
  });

  return (
    <header className="sticky top-0 z-40 bg-paper">
      {/* Top metadata bar */}
      <div className="border-b border-border bg-foreground/2">
        <div className="container-edit flex h-7 items-center justify-between text-[9px] tracking-widest text-muted-foreground uppercase">
          <span className="hidden sm:inline">Saturday, 11 July 2026 · Chennai Edition</span>
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            {isLoggedIn ? (
              <>
                <span className="text-foreground/80">{currentUser?.fullName || currentUser?.username || "Account"}</span>
                <span className="hidden sm:inline text-border">|</span>
                <Link to="/account" className="hover:text-primary transition-colors hidden sm:inline">My Account</Link>
                {currentUser?.role === "admin" && (
                  <>
                    <span className="hidden sm:inline text-border">|</span>
                    <Link to="/admin" className="hover:text-primary transition-colors hidden sm:inline">Admin</Link>
                  </>
                )}
                <span className="hidden sm:inline text-border">|</span>
                <button 
                  onClick={() => logoutMutation.mutate()}
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <LogOut className="h-2.5 w-2.5" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
                <span className="hidden sm:inline text-border">|</span>
                <Link to="/register" className="hover:text-primary transition-colors">Register</Link>
              </>
            )}
            <span className="hidden sm:inline text-border">|</span>
            <Link to="/cart" className="hover:text-primary transition-colors inline-flex items-center gap-1">
              <ShoppingCart className="h-3 w-3" /> Cart
            </Link>
          </div>
        </div>
      </div>

      {/* Large Logo Strip - Full Width */}
      <div className="border-b border-border flex justify-center py-4">
        <Link to="/" className="block">
          <img 
            src={logoImg} 
            alt="Swathi Publications" 
            className="h-auto max-h-20 object-contain"
          />
        </Link>
      </div>

      {/* Main Header - Navigation and Actions */}
      <div className="border-b border-border">
        <div className="container-edit flex items-center justify-between gap-4 py-3">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1 gap-6">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-primary font-semibold" }}
                inactiveProps={{ className: "text-foreground/60 hover:text-primary" }}
                className="text-xs uppercase tracking-widest font-medium transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Actions - Search and Account */}
          <div className="flex items-center justify-end gap-4 w-full md:w-auto">
            <Link to="/search" className="hidden sm:inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors">
              <Search className="h-4 w-4" />
              <span className="hidden md:inline text-xs uppercase tracking-widest font-medium">Search</span>
            </Link>
            <Link to="/account" aria-label="Account" className="text-foreground/60 hover:text-primary transition-colors">
              <User className="h-5 w-5" />
            </Link>
            <button
              className="md:hidden text-foreground/60 hover:text-primary transition-colors"
              aria-label="Menu"
              onClick={() => setOpen((o) => !o)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="md:hidden border-t border-border bg-secondary/30">
          <nav className="container-edit flex flex-col gap-1 py-3">
            {NAV.map((n) => (
              <Link 
                key={n.to} 
                to={n.to} 
                className="py-2 px-2 text-sm uppercase tracking-widest font-medium rounded hover:bg-secondary transition-colors"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
